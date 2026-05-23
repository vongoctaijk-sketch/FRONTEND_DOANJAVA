import {
  Table,
  Button,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";

import Api from "../Api/axios";

const { Title } = Typography;

function Author() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await Api.get("/api/tac-gia");
      setData(res.data);
    } catch {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      hoTen: record.hoTen,
      quocTich: record.quocTich,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/tac-gia/${id}`);
      message.success("Xóa thành công");
      fetchData();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await Api.put(`/api/tac-gia/${editing.id}`, values);
        message.success("Sửa thành công");
      } else {
        await Api.post("/api/tac-gia", values);
        message.success("Thêm thành công");
      }
      setOpen(false);
      fetchData();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const filteredData = data.filter((x) =>
    x.hoTen?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "Thông tin tác giả",
      render: (_, r) => (
        <Space align="start">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#722ed1,#b37feb)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {r.hoTen?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{r.hoTen}</div>
            <div style={{ color: "#8c8c8c", marginTop: 4 }}>
              <UserOutlined /> {r.quocTich || "Chưa cập nhật quốc tịch"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Quốc tịch",
      dataIndex: "quocTich",
      render: (v) => (
        <Tag
          color="purple"
          style={{
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          {v || "Không có"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 130,
      align: "center",
      render: (_, r) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: "#1677ff", fontSize: 18 }}
            onClick={() => handleEdit(r)}
          />
          <Popconfirm
            title="Xác nhận xóa tác giả?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              style={{ fontSize: 18 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24, // Đồng bộ padding bọc ngoài sát cạnh của trang hóa đơn
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      {/* 🟦 CARD TÁC VỤ: TIÊU ĐỀ + TÌM KIẾM + NÚT THÊM TRÊN 1 DÒNG */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Row justify="space-between" align="middle">
          {/* Cột trái chứa Tiêu đề */}
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              ✍️ Quản lý tác giả
            </Title>
          </Col>

          {/* Cột phải chứa Ô tìm kiếm, Nút Reset và Nút Thêm */}
          <Col>
            <Space size="middle">
              <Input
                placeholder="Tìm tác giả..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 240, // Khớp chuẩn xác 240px của ô tìm kiếm hóa đơn
                  borderRadius: 8,
                }}
              />

              <Button
                icon={<ReloadOutlined />}
                style={{ borderRadius: 8 }}
                onClick={() => setSearchText("")}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ borderRadius: 8, fontWeight: 500 }} // Chuyển về default size mảnh dẻ, gọn gàng
              >
                Thêm tác giả
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* CARD BẢNG DANH SÁCH KHỐI DƯỚI */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
          }}
        />
      </Card>

      {/* MODAL THÊM / SỬA TÁC GIẢ */}
      <Modal
        title={editing ? "✏️ Sửa tác giả" : "✍️ Thêm tác giả"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        centered
        destroyOnClose
        width={550}
        okText="Lưu"
        cancelText="Hủy"
        maskClosable={false}
        style={{ top: 20 }}
        bodyStyle={{ paddingTop: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input
              size="large"
              placeholder="Nhập họ tên tác giả"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item name="quocTich" label="Quốc tịch">
            <Input
              size="large"
              placeholder="Ví dụ: Việt Nam"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Author;
