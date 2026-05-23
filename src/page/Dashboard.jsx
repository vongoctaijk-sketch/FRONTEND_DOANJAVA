import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  RiseOutlined,
  StockOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import Api from "../Api/axios";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mostStocked, setMostStocked] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const safeFetch = async (url, setter) => {
        try {
          const res = await Api.get(url);
          setter(res.data?.data || res.data || []);
        } catch (err) {
          setter([]);
        }
      };

      await Promise.all([
        safeFetch("/api/bao-cao/ton-kho-nhieu-nhat", setMostStocked),
        safeFetch("/api/bao-cao/sach-ban-chay", setBestSellers),
        safeFetch("/api/bao-cao/doanh-thu-thang", setMonthlyRevenue),
        safeFetch("/api/bao-cao/doanh-thu-ngay", setDailyRevenue),
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TÍNH TOÁN KPI NHANH ================= */
  const totalDailyRevenue = useMemo(
    () => dailyRevenue.reduce((sum, item) => sum + (item.tongTien || 0), 0),
    [dailyRevenue],
  );
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const found = monthlyRevenue.find((item) => item.thang === currentMonth);
    return found ? found.tongTien : 0;
  }, [monthlyRevenue]);
  const totalBooksSold = useMemo(
    () => bestSellers.reduce((sum, item) => sum + (item.soLuongDaBan || 0), 0),
    [bestSellers],
  );
  const totalStockCount = useMemo(
    () => mostStocked.reduce((sum, item) => sum + (item.soLuongTonKho || 0), 0),
    [mostStocked],
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        <Spin
          size="large"
          description="Đang tải dữ liệu tổng quan bảng điều khiển..."
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f6fa", minHeight: "100vh" }}>
      {/* TIÊU ĐỀ DASHBOARD */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          🏠 Bảng điều khiển tổng quan (Dashboard)
        </Title>
        <Text type="secondary">
          Theo dõi nhanh trạng thái hoạt động kinh doanh của nhà sách hôm nay
        </Text>
      </Card>

      {/* KPI METRICS CARDS */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Doanh thu hôm nay"
              value={totalDailyRevenue}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
              valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Doanh thu tháng này"
              value={currentMonthRevenue}
              prefix={<CalendarOutlined />}
              suffix="đ"
              valueStyle={{ color: "#1d39c4", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Sách đã bán (Nhóm Top)"
              value={totalBooksSold}
              prefix={<RiseOutlined />}
              suffix="cuốn"
              valueStyle={{ color: "#389e0d", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Statistic
              title="Sách tồn kho (Nhóm Top)"
              value={totalStockCount}
              prefix={<StockOutlined />}
              suffix="cuốn"
              valueStyle={{ color: "#d46b08", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* BẢNG BIỂU CHI TIẾT */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <RiseOutlined style={{ color: "#52c41a" }} /> Sách bán chạy nhất
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Table
              dataSource={bestSellers}
              rowKey={(r, i) => i}
              pagination={{ pageSize: 5 }}
              size="middle"
              columns={[
                {
                  title: "STT",
                  width: 60,
                  align: "center",
                  render: (_, __, i) => (
                    <Tag
                      color={
                        i === 0
                          ? "gold"
                          : i === 1
                            ? "silver"
                            : i === 2
                              ? "orange"
                              : "default"
                      }
                      style={{ fontWeight: "bold" }}
                    >
                      {i + 1}
                    </Tag>
                  ),
                },
                { title: "Tên sách", dataIndex: "tenSach" },
                {
                  title: "Số lượng đã bán",
                  dataIndex: "soLuongDaBan",
                  align: "right",
                  render: (v) => (
                    <Text strong style={{ color: "#52c41a" }}>
                      {v?.toLocaleString()} cuốn
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <StockOutlined style={{ color: "#fa8c16" }} /> Cảnh báo sách tồn
                kho cao
              </span>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Table
              dataSource={mostStocked}
              rowKey={(r, i) => i}
              pagination={{ pageSize: 5 }}
              size="middle"
              columns={[
                {
                  title: "STT",
                  width: 60,
                  align: "center",
                  render: (_, __, i) => (
                    <Tag style={{ fontWeight: "bold" }}>{i + 1}</Tag>
                  ),
                },
                { title: "Tên sách", dataIndex: "tenSach" },
                {
                  title: "Số lượng tồn",
                  dataIndex: "soLuongTonKho",
                  align: "right",
                  render: (v) => (
                    <Text strong style={{ color: "#f5222d" }}>
                      {v?.toLocaleString()} cuốn
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
