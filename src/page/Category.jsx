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
  TagsOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";

import Api from "../Api/axios";

const { Title } = Typography;

function Category() {
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
      const res = await Api.get("/api/the-loai");
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
      tenTheLoai: record.tenTheLoai,
      moTa: record.moTa,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/the-loai/${id}`);
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
        await Api.put(`/api/the-loai/${editing.id}`, values);
        message.success("Sửa thành công");
      } else {
        await Api.post("/api/the-loai", values);
        message.success("Thêm thành công");
      }
      setOpen(false);
      fetchData();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const filteredData = data.filter((x) =>
    x.tenTheLoai?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "Thông tin thể loại",
      render: (_, r) => (
        <Space align="start">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#1677ff,#69b1ff)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: 22,
            }}
          >
            <TagsOutlined />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              {r.tenTheLoai}
            </div>
            <Tag
              color="blue"
              style={{
                borderRadius: 8,
                padding: "4px 10px",
              }}
            >
              Thể loại sách
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      render: (v) => (
        <span style={{ color: "#595959" }}>{v || "Không có mô tả"}</span>
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
            title="Xác nhận xóa thể loại?"
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
        padding: 24, // Đồng bộ padding bọc ngoài khít lề của trang hóa đơn
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
              📚 Quản lý thể loại
            </Title>
          </Col>

          {/* Cột phải chứa Ô tìm kiếm, Nút Reset và Nút Thêm thể loại */}
          <Col>
            <Space size="middle">
              <Input
                placeholder="Tìm thể loại..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 240, // Khóa cứng kích thước chuẩn 240px bằng trang hóa đơn
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
                style={{ borderRadius: 8, fontWeight: 500 }} // Đưa về kích thước default mảnh dẻ gọn gàng
              >
                Thêm thể loại
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

      {/* MODAL THÊM / SỬA THỂ LOẠI */}
      <Modal
        title={editing ? "✏️ Sửa thể loại" : "📚 Thêm thể loại"}
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
            name="tenTheLoai"
            label="Tên thể loại"
            rules={[{ required: true, message: "Vui lòng nhập tên thể loại" }]}
          >
            <Input
              size="large"
              placeholder="Nhập tên thể loại"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea
              rows={5}
              placeholder="Nhập mô tả thể loại"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Category;
