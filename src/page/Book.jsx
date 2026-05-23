import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Image,
  Popconfirm,
  Space,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Modal,
  Upload,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import Api from "../Api/axios";

const { Title } = Typography;

function Sach() {
  const [data, setData] = useState([]);
  const [theLoaiList, setTheLoaiList] = useState([]);
  const [tacGiaList, setTacGiaList] = useState([]);
  const [nxbList, setNxbList] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterTheLoai, setFilterTheLoai] = useState(null);
  const [filterNxb, setFilterNxb] = useState(null);

  const [openTacGia, setOpenTacGia] = useState(false);
  const [openTheLoai, setOpenTheLoai] = useState(false);
  const [openNxb, setOpenNxb] = useState(false);

  const [form] = Form.useForm();
  const [formTacGia] = Form.useForm();
  const [formTheLoai] = Form.useForm();
  const [formNxb] = Form.useForm();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sach, tl, tg, nxb] = await Promise.all([
        Api.get("/api/sach"),
        Api.get("/api/the-loai"),
        Api.get("/api/tac-gia"),
        Api.get("/api/nha-xuat-ban"),
      ]);
      setData(sach.data);
      setTheLoaiList(tl.data);
      setTacGiaList(tg.data);
      setNxbList(nxb.data);
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
      tenSach: record.tenSach,
      giaBan: record.giaBan,
      soLuongTon: record.soLuongTon,

      hinhAnh: record.hinhAnh
        ? [
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: record.hinhAnh,
            },
          ]
        : [],

      namXuatBan: record.namXuatBan,
      maTheLoai: record.theLoai?.id,
      maNhaXuatBan: record.nhaXuatBan?.id,
      danhSachTacGia: record.danhSachTacGia?.map((x) => x.id) || [],
    });

    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/sach/${id}`);
      message.success("Xóa thành công");
      fetchAll();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleOk = async () => {
    try {
      const v = await form.validateFields();

      const formData = new FormData();

      formData.append("tenSach", v.tenSach);
      formData.append("giaBan", v.giaBan);
      formData.append("soLuongTon", v.soLuongTon);
      formData.append("namXuatBan", v.namXuatBan);

      formData.append("theLoaiId", v.maTheLoai);
      formData.append("nhaXuatBanId", v.maNhaXuatBan);

      (v.danhSachTacGia || []).forEach((id) => {
        formData.append("tacGiaIds", id);
      });

      if (v.hinhAnh && v.hinhAnh.length > 0 && v.hinhAnh[0].originFileObj) {
        formData.append("hinhAnh", v.hinhAnh[0].originFileObj);
      }
      if (editing) {
        await Api.put(`/api/sach/${editing.id}`, formData);
        message.success("Sửa thành công");
      } else {
        await Api.post("/api/sach", formData);
        message.success("Thêm thành công");
      }

      setOpen(false);
      fetchAll();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleCreateTacGia = async () => {
    try {
      const v = await formTacGia.validateFields();
      const payload = { hoTen: v.hoTen, quocTich: v.quocTich };
      const res = await Api.post("/api/tac-gia", payload);
      setTacGiaList((prev) => [...prev, res.data]);
      form.setFieldValue("danhSachTacGia", [
        ...(form.getFieldValue("danhSachTacGia") || []),
        res.data.id,
      ]);
      formTacGia.resetFields();
      setOpenTacGia(false);
      message.success("Thêm tác giả thành công");
    } catch {
      message.error("Lỗi thêm tác giả");
    }
  };

  const handleCreateTheLoai = async () => {
    try {
      const v = await formTheLoai.validateFields();
      const payload = { tenTheLoai: v.tenTheLoai, moTa: v.moTa };
      const res = await Api.post("/api/the-loai", payload);
      setTheLoaiList((prev) => [...prev, res.data]);
      form.setFieldValue("maTheLoai", res.data.id);
      formTheLoai.resetFields();
      setOpenTheLoai(false);
      message.success("Thêm thể loại thành công");
    } catch {
      message.error("Lỗi thêm thể loại");
    }
  };

  const handleCreateNxb = async () => {
    try {
      const v = await formNxb.validateFields();
      const payload = { tenNXB: v.tenNXB, diaChi: v.diaChi };
      const res = await Api.post("/api/nha-xuat-ban", payload);
      setNxbList((prev) => [...prev, res.data]);
      form.setFieldValue("maNhaXuatBan", res.data.id);
      formNxb.resetFields();
      setOpenNxb(false);
      message.success("Thêm NXB thành công");
    } catch {
      message.error("Lỗi thêm NXB");
    }
  };

  const filteredData = data.filter((item) => {
    const matchSearch = item.tenSach
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    const matchTheLoai = !filterTheLoai || item.theLoai?.id === filterTheLoai;
    const matchNxb = !filterNxb || item.nhaXuatBan?.id === filterNxb;
    return matchSearch && matchTheLoai && matchNxb;
  });

  const columns = [
    {
      title: "Thông tin sách",
      key: "info",
      width: 380,
      render: (_, r) => (
        <Space align="start">
          <Image
            src={r.hinhAnh}
            width={60}
            height={85}
            style={{
              borderRadius: 8,
              objectFit: "cover",
            }}
            fallback="https://via.placeholder.com/60x85"
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{r.tenSach}</div>
            <div style={{ color: "#8c8c8c", fontSize: 13 }}>
              Năm XB: {r.namXuatBan}
            </div>
            <div style={{ color: "#595959", fontSize: 13 }}>
              NXB: {r.nhaXuatBan?.tenNXB}
            </div>
            <div style={{ marginTop: 5 }}>
              {(r.danhSachTacGia || []).map((tg) => (
                <Tag key={tg.id} color="purple">
                  {tg.hoTen}
                </Tag>
              ))}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Thể loại",
      width: 150,
      render: (_, r) => <Tag color="blue">{r.theLoai?.tenTheLoai}</Tag>,
    },
    {
      title: "Giá bán",
      dataIndex: "giaBan",
      width: 140,
      render: (v) => (
        <span style={{ color: "#cf1322", fontWeight: 700 }}>
          {v?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "soLuongTon",
      width: 130,
      render: (v) => {
        let color = "green";
        if (v <= 5) color = "red";
        else if (v <= 15) color = "orange";
        return <Tag color={color}>{v} cuốn</Tag>;
      },
    },
    {
      title: "Thao tác",
      width: 120,
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
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(r.id)}
            okText="Xóa"
            cancelText="Hủy"
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
        padding: 24,
        background: "#f0f2f5",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Không cho toàn bộ trang cuộn tự do
      }}
    >
      {/* 🟦 BỘ LỌC ĐỒNG BỘ */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              📚 Quản lý sách
            </Title>
          </Col>

          <Col>
            <Space size="middle">
              <Input
                placeholder="Tìm tên sách..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 240,
                  borderRadius: 8,
                }}
              />

              <Select
                allowClear
                placeholder="Chọn thể loại"
                style={{ width: 150 }}
                dropdownStyle={{ borderRadius: 8 }}
                value={filterTheLoai}
                onChange={setFilterTheLoai}
              >
                {theLoaiList.map((x) => (
                  <Select.Option key={x.id} value={x.id}>
                    {x.tenTheLoai}
                  </Select.Option>
                ))}
              </Select>

              <Select
                allowClear
                placeholder="Chọn NXB"
                style={{ width: 150 }}
                dropdownStyle={{ borderRadius: 8 }}
                value={filterNxb}
                onChange={setFilterNxb}
              >
                {nxbList.map((x) => (
                  <Select.Option key={x.id} value={x.id}>
                    {x.tenNXB}
                  </Select.Option>
                ))}
              </Select>

              <Button
                icon={<ReloadOutlined />}
                style={{ borderRadius: 8 }}
                onClick={() => {
                  setSearchText("");
                  setFilterTheLoai(null);
                  setFilterNxb(null);
                }}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Thêm sách
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 📊 BẢNG DỮ LIỆU ĐÃ ĐƯỢC GIỚI HẠN CHIỀU CAO CUỘN CỐ ĐỊNH */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            size: "default",
            showTotal: (total) => `Tổng số ${total} cuốn sách`,
            position: ["bottomRight"],
          }}
          // Cố định chiều cao vùng body để thanh phân trang không bị đẩy xuống đáy
          scroll={{ y: "calc(100vh - 340px)" }}
          style={{ flex: 1 }}
        />
      </Card>

      {/* ==================== CÁC MODAL HỆ THỐNG ĐÃ CHUẨN HÓA ANTD V5 ==================== */}
      <Modal
        title={editing ? "✏️ Sửa sách" : "📚 Thêm sách"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        centered
        destroyOnClose
        maskClosable={false}
        width={720}
        okText="Lưu"
        cancelText="Hủy"
        style={{ top: 20 }}
        styles={{
          body: { maxHeight: "65vh", overflowY: "auto", paddingTop: 16 },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tenSach"
            label="Tên sách"
            rules={[{ required: true, message: "Vui lòng nhập tên sách" }]}
          >
            <Input
              size="large"
              placeholder="Nhập tên sách"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="giaBan" label="Giá bán">
                <InputNumber
                  size="large"
                  min={0}
                  style={{ width: "100%", borderRadius: 8 }}
                  placeholder="đ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soLuongTon" label="Số lượng tồn">
                <InputNumber
                  size="large"
                  min={0}
                  style={{ width: "100%", borderRadius: 8 }}
                  placeholder="cuốn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="namXuatBan" label="Năm xuất bản">
            <InputNumber
              size="large"
              min={1000}
              style={{ width: "100%", borderRadius: 8 }}
              placeholder="Ví dụ: 2026"
            />
          </Form.Item>

          <Form.Item
            name="hinhAnh"
            label="Ảnh sách"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
              <Button>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {() => {
              const img = form.getFieldValue("hinhAnh");

              if (!img || img.length === 0) return null;

              const file = img[0];

              const src = file.url || URL.createObjectURL(file.originFileObj);

              return (
                <div style={{ marginBottom: 20, textAlign: "center" }}>
                  <Image
                    src={src}
                    width={130}
                    height={180}
                    style={{
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                </div>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maTheLoai"
                label="Thể loại"
                rules={[{ required: true, message: "Chọn thể loại" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn thể loại"
                  style={{ borderRadius: 8 }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ padding: "0 8px 8px" }}>
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => setOpenTheLoai(true)}
                        >
                          Thêm thể loại
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {theLoaiList.map((x) => (
                    <Select.Option key={x.id} value={x.id}>
                      {x.tenTheLoai}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="maNhaXuatBan"
                label="Nhà xuất bản"
                rules={[{ required: true, message: "Chọn nhà xuất bản" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn NXB"
                  style={{ borderRadius: 8 }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ padding: "0 8px 8px" }}>
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => setOpenNxb(true)}
                        >
                          Thêm NXB
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {nxbList.map((x) => (
                    <Select.Option key={x.id} value={x.id}>
                      {x.tenNXB}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="danhSachTacGia"
            label="Tác giả"
            rules={[{ required: true, message: "Chọn tác giả" }]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder="Chọn tác giả"
              style={{ borderRadius: 8 }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ padding: "0 8px 8px" }}>
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => setOpenTacGia(true)}
                    >
                      Thêm tác giả
                    </Button>
                  </div>
                </>
              )}
            >
              {tacGiaList.map((x) => (
                <Select.Option key={x.id} value={x.id}>
                  {x.hoTen}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL TÁC GIẢ */}
      <Modal
        title="➕ Thêm tác giả"
        open={openTacGia}
        onCancel={() => setOpenTacGia(false)}
        onOk={handleCreateTacGia}
        centered
        destroyOnClose
        width={500}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
        zIndex={2000}
      >
        <Form form={formTacGia} layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: "Nhập tên tác giả" }]}
          >
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="quocTich" label="Quốc tịch">
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL THỂ LOẠI */}
      <Modal
        title="➕ Thêm thể loại"
        open={openTheLoai}
        onCancel={() => setOpenTheLoai(false)}
        onOk={handleCreateTheLoai}
        centered
        destroyOnClose
        width={500}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
        zIndex={2000}
      >
        <Form form={formTheLoai} layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item
            name="tenTheLoai"
            label="Tên thể loại"
            rules={[{ required: true, message: "Nhập tên thể loại" }]}
          >
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={4} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL NXB */}
      <Modal
        title="➕ Thêm nhà xuất bản"
        open={openNxb}
        onCancel={() => setOpenNxb(false)}
        onOk={handleCreateNxb}
        centered
        destroyOnClose
        width={500}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
        zIndex={2000}
      >
        <Form form={formNxb} layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item
            name="tenNXB"
            label="Tên NXB"
            rules={[{ required: true, message: "Nhập tên NXB" }]}
          >
            <Input size="large" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ">
            <Input.TextArea rows={4} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Sach;
