import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Typography,
  Space,
  Spin,
  Empty,
  Button,
  Radio,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import Api from "../Api/axios";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
);
const { Title, Text } = Typography;

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // 'date' = xem theo ngày của tháng, 'month' = xem theo tháng của năm
  const [viewMode, setViewMode] = useState("date");
  const [selectedTime, setSelectedTime] = useState(dayjs());

  useEffect(() => {
    fetchReportData();
  }, [selectedTime, viewMode]);

  const fetchReportData = async () => {
    if (!selectedTime) return;

    const nam = selectedTime.year();
    const thang = selectedTime.month() + 1;

    setLoading(true);
    try {
      if (viewMode === "date") {
        // Gọi API doanh thu theo từng ngày
        const res = await Api.get("/api/bao-cao/doanh-thu-ngay", {
          params: { nam, thang },
        });
        setReportData(res.data?.data || res.data || []);
      } else {
        // Gọi API doanh thu theo từng tháng trong năm
        const res = await Api.get("/api/bao-cao/doanh-thu-thang", {
          params: { nam },
        });
        setReportData(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHUYỂN ĐỔI DATA SANG ĐỊNH DẠNG ĐỒ THỊ ================= */
  const chartData = useMemo(() => {
    if (!selectedTime || !Array.isArray(reportData)) {
      return { labels: [], datasets: [] };
    }

    let labels = [];
    let datasetLabel = "";

    if (viewMode === "date") {
      // Logic xử lý ghép ngày: Trả về dạng DD/MM/YYYY
      const currentYear = selectedTime.year();
      const currentMonth = String(selectedTime.month() + 1).padStart(2, "0");
      labels = reportData.map(
        (item) =>
          `${String(item.ngay).padStart(2, "0")}/${currentMonth}/${currentYear}`,
      );
      datasetLabel = "Doanh thu theo ngày (VND)";
    } else {
      // Logic xử lý ghép tháng: Trả về dạng Tháng MM/YYYY
      const currentYear = selectedTime.year();
      labels = reportData.map(
        (item) => `Tháng ${String(item.thang).padStart(2, "0")}/${currentYear}`,
      );
      datasetLabel = "Doanh thu theo tháng (VND)";
    }

    return {
      labels: labels,
      datasets: [
        {
          label: datasetLabel,
          data: reportData.map((item) => item.tongTien),
          backgroundColor:
            viewMode === "date"
              ? "rgba(24, 144, 255, 0.6)"
              : "rgba(114, 46, 209, 0.6)", // Đổi màu sắc sinh động để phân biệt 2 chế độ
          borderColor:
            viewMode === "date" ? "rgb(24, 144, 255)" : "rgb(114, 46, 209)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [reportData, selectedTime, viewMode]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `${value.toLocaleString()} đ` },
      },
    },
  };

  return (
    <div style={{ padding: 24, background: "#f5f6fa", minHeight: "100vh" }}>
      {/* CARD THANH THAO TÁC ĐỒNG BỘ GIAO DIỆN CHUẨN */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              📊 Phân tích hiệu suất doanh thu
            </Title>
            <Text type="secondary">
              Chuyển đổi linh hoạt giữa góc nhìn chi tiết theo ngày hoặc tổng
              quan theo tháng
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              {/* Nút chuyển đổi chế độ xem mượt mà bằng Radio group */}
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="date">Theo Ngày</Radio.Button>
                <Radio.Button value="month">Theo Tháng</Radio.Button>
              </Radio.Group>

              <CalendarOutlined style={{ color: "#1890ff", fontSize: 16 }} />

              {/* Cấu hình bộ chọn thời gian động tương ứng với chế độ đang chọn */}
              <DatePicker
                picker={viewMode === "date" ? "month" : "year"} // Xem ngày thì chọn Tháng, xem tháng thì chọn Năm
                value={selectedTime}
                onChange={(val) => {
                  if (val) setSelectedTime(val);
                }}
                format={viewMode === "date" ? "MM/YYYY" : "YYYY"}
                allowClear={false}
                style={{ borderRadius: 8, width: 140 }}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReportData}
                loading={loading}
                style={{ borderRadius: 8 }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KHỐI BIỂU ĐỒ TRỰC QUAN */}
      <Row>
        <Col span={24}>
          <Card
            title={
              <span>
                <BarChartOutlined /> Biểu đồ xu hướng doanh số biến động (
                {viewMode === "date" ? "Cột Ngày" : "Cột Tháng"})
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Spin
              spinning={loading}
              description="Đang xử lý cấu trúc dữ liệu..."
            >
              <div style={{ height: 450, minHeight: 300 }}>
                {chartData.labels && chartData.labels.length > 0 ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div style={{ padding: "80px 0" }}>
                    <Empty
                      description={`Hệ thống không ghi nhận doanh thu hoàn thành nào trong khoảng thời gian này`}
                    />
                  </div>
                )}
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
