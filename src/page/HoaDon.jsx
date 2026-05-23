import { useMemo, useState, useEffect } from "react";

import {
  Button,
  Table,
  Drawer,
  Modal,
  Input,
  DatePicker,
  Tag,
  Space,
  InputNumber,
  Card,
  message,
  Row,
  Col,
  Divider,
  Typography,
  Image,
  Form,
  Popconfirm,
  Tooltip,
} from "antd";

import {
  PlusOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import Api from "../Api/axios";

const { Title, Text } = Typography;

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchBook, setSearchBook] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formCustomer] = Form.useForm();

  useEffect(() => {
    fetchInvoices();
    fetchBooks();
    fetchCustomers();
    loadCurrentUser();
  }, []);

  /* ================= USER ================= */
  const cancelInvoice = async (id) => {
    try {
      await Api.put(`/api/hoa-don/${id}/huy_don`);
      message.success("Đã hủy hóa đơn thành công");
      fetchInvoices();
      if (detail && detail.id === id) {
        setDetail((prev) => ({ ...prev, trangThai: "HUY_DON" }));
        setOpenDetail(false);
      }
    } catch {
      message.error("Hủy hóa đơn thất bại");
    }
  };

  const resetCart = () => {
    setSelected([]);
    setSelectedCustomer(null);
    setCustomerPhone("");
    setSearchBook("");
  };

  const loadCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  /* ================= LOAD ================= */
  const fetchInvoices = async () => {
    try {
      const res = await Api.get("/api/hoa-don");
      const data =
        res.data?.data ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);
      setInvoices(data);
    } catch {
      setInvoices([]);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await Api.get("/api/sach");
      const data =
        res.data?.data ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);
      setBooks(data);
    } catch {
      setBooks([]);
      message.error("Lỗi tải sách");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await Api.get("/api/khach-hang");
      const data =
        res.data?.data ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);
      setCustomers(data);
    } catch {
      setCustomers([]);
    }
  };

  /* ================= BOOK ================= */
  const toggleBook = (b) => {
    const ex = selected.find((x) => x.id === b.id);
    if (ex) {
      setSelected(selected.filter((x) => x.id !== b.id));
    } else {
      setSelected([
        ...selected,
        {
          id: b.id,
          tenSach: b.tenSach,
          gia: b.giaBan,
          sl: 1,
          hinhAnh: b.hinhAnh,
          tonKho: b.soLuongTon,
        },
      ]);
    }
  };

  const changeQty = (id, sl) => {
    setSelected(
      selected.map((x) =>
        x.id === id
          ? {
              ...x,
              sl: sl || 1,
            }
          : x,
      ),
    );
  };

  const removeCart = (id) => {
    setSelected(selected.filter((x) => x.id !== id));
  };

  /* ================= TOTAL ================= */
  const total = useMemo(() => {
    return selected.reduce((a, b) => a + b.gia * b.sl, 0);
  }, [selected]);

  /* ================= CUSTOMER ================= */
  const handleFindCustomer = () => {
    const kh = customers.find((x) => x.sdt === customerPhone);
    if (!kh) {
      message.warning("Không tìm thấy khách hàng");
      setSelectedCustomer(null);
      return;
    }
    setSelectedCustomer(kh);
    message.success("Đã tìm thấy khách hàng");
  };

  const createCustomer = async () => {
    try {
      const v = await formCustomer.validateFields();
      const res = await Api.post("/api/khach-hang", {
        hoTen: v.hoTen,
        sdt: v.sdt,
        email: v.email,
      });
      setCustomers((prev) => [...prev, res.data]);
      setSelectedCustomer(res.data);
      setCustomerPhone(res.data.sdt);
      setOpenCustomer(false);
      formCustomer.resetFields();
      message.success("Tạo khách hàng thành công");
    } catch {
      message.error("Lỗi tạo khách hàng");
    }
  };

  /* ================= CREATE INVOICE ================= */
  const createInvoice = async () => {
    if (selected.length === 0) {
      message.warning("Chưa chọn sách");
      return;
    }
    if (!selectedCustomer) {
      message.warning("Vui lòng chọn khách hàng");
      return;
    }
    if (!currentUser?.id) {
      message.error("Không lấy được thông tin nhân viên");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        khachHangId: selectedCustomer.id,
        nhanVienId: Number(currentUser?.id),
        danhSachChiTiet: selected.map((x) => ({
          sachID: x.id,
          soLuong: x.sl,
        })),
      };

      await Api.post("/api/hoa-don", payload);
      message.success("Tạo hóa đơn thành công");
      resetCart();
      setOpenCreate(false);
      fetchInvoices();
      fetchBooks();
    } catch (e) {
      message.error(e?.response?.data?.message || "Lỗi tạo hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredBooks = books.filter((b) =>
    b.tenSach?.toLowerCase().includes(searchBook.toLowerCase()),
  );

  const filteredInvoices = invoices.filter((x) =>
    String(x.id || "")
      .toLowerCase()
      .includes(searchInvoice.toLowerCase()),
  );

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id",
      width: 120,
      render: (v) => (
        <Tag color="blue" style={{ fontWeight: 600, padding: "2px 8px" }}>
          #{v}
        </Tag>
      ),
    },
    {
      title: "Ngày bán",
      dataIndex: "ngayBan",
      width: 180,
      render: (v) => {
        if (!v) return "";
        const d = new Date(v);
        if (isNaN(d.getTime())) return v;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return (
          <Space size={6} style={{ color: "#595959" }}>
            <CalendarOutlined />
            <span>{`${day}/${month}/${year} ${hours}:${minutes}`}</span>
          </Space>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      render: (v) => (
        <span
          style={{
            color: "#cf1322",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          {v?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (t) => {
        let color = "orange";
        let text = t;
        if (t === "HOAN THANH") {
          color = "green";
          text = "Hoàn thành";
        }
        if (t === "HUY_DON" || t === "DA HUY") {
          color = "red";
          text = "Đã hủy";
        }
        return (
          <Tag
            color={color}
            style={{ borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      width: 140,
      align: "center",
      render: (_, r) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              size="middle"
              ghost
              onClick={() => {
                setDetail(r);
                setOpenDetail(true);
              }}
            />
          </Tooltip>

          {r.trangThai !== "HUY_DON" && r.trangThai !== "DA_HUY" ? (
            <Popconfirm
              title="Hủy hóa đơn"
              description="Bạn chắc chắn muốn hủy đơn hàng này chứ?"
              onConfirm={() => cancelInvoice(r.id)}
              okText="Hủy đơn"
              cancelText="Quay lại"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Tooltip title="Hủy hóa đơn">
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<CloseCircleOutlined />}
                  size="middle"
                  ghost
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Button
              shape="circle"
              icon={<CloseCircleOutlined />}
              size="middle"
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              🧾 Quản lý hóa đơn
            </Title>
          </Col>

          <Col>
            <Space size="middle">
              <Input
                placeholder="Tìm mã hóa đơn (ID)..."
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                style={{
                  width: 240,
                  borderRadius: 8,
                }}
              />
              <DatePicker style={{ borderRadius: 8 }} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenCreate(true)}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Tạo hóa đơn
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 8,
          }}
        />
      </Card>

      {/* ================= CREATE INVOICE MODAL ================= */}
      <Modal
        title="🧾 Tạo hóa đơn"
        open={openCreate}
        onCancel={() => {
          setOpenCreate(false);
          resetCart();
        }}
        onOk={createInvoice}
        width={1000} // Thu nhỏ kích thước tổng thể vừa màn hình laptop
        confirmLoading={loading}
        centered
        bodyStyle={{ padding: "12px 0 0 0" }}
      >
        {/* Giới hạn chiều cao tổng thể của nội dung Modal, tránh lỗi tràn màn hình */}
        <Row
          gutter={20}
          style={{
            maxHeight: "72vh",
            overflowY: "auto",
            overflowX: "hidden",
            margin: 0,
          }}
        >
          {/* ================= LEFT COLUMN ================= */}
          <Col span={14} style={{ paddingLeft: 0 }}>
            <Card
              size="small"
              style={{
                marginBottom: 16,
                borderRadius: 12,
              }}
            >
              <Space
                direction="vertical"
                style={{
                  width: "100%",
                }}
              >
                <Title level={5}>👤 Khách hàng</Title>
                <Space.Compact
                  style={{
                    width: "100%",
                  }}
                >
                  <Input
                    placeholder="Nhập số điện thoại khách hàng..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <Button onClick={handleFindCustomer}>Tìm</Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenCustomer(true)}
                  >
                    Tạo KH
                  </Button>
                </Space.Compact>

                {selectedCustomer && (
                  <Card
                    size="small"
                    style={{
                      marginTop: 12,
                      borderRadius: 10,
                      background: "#fafafa",
                    }}
                  >
                    <Space direction="vertical" size={4}>
                      <div>
                        <b>{selectedCustomer.hoTen}</b>
                      </div>
                      <Tag color="blue">KH#{selectedCustomer.id}</Tag>
                      <div>SĐT: {selectedCustomer.sdt}</div>
                      <div>Email: {selectedCustomer.email}</div>
                    </Space>
                  </Card>
                )}
              </Space>
            </Card>

            <Card
              size="small"
              style={{
                borderRadius: 12,
              }}
            >
              <Input
                placeholder="Tìm sách..."
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                style={{
                  marginBottom: 14,
                }}
              />
              <Table
                size="small"
                rowKey="id"
                dataSource={filteredBooks}
                pagination={{
                  pageSize: 5,
                }}
                scroll={{
                  y: 280, // Khóa chiều cao trượt của bảng tìm sách nội bộ
                }}
                columns={[
                  {
                    title: "Sách",
                    render: (_, r) => (
                      <Space align="start">
                        <Image
                          src={r.hinhAnh}
                          width={55}
                          height={75}
                          style={{
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                          fallback="https://via.placeholder.com/55x75"
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.tenSach}</div>
                          <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                            Tồn kho: {r.soLuongTon}
                          </div>
                        </div>
                      </Space>
                    ),
                  },
                  {
                    title: "Giá",
                    dataIndex: "giaBan",
                    width: 110,
                    render: (v) => `${v?.toLocaleString()} đ`,
                  },
                  {
                    title: "",
                    width: 80,
                    render: (_, r) => (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => toggleBook(r)}
                      >
                        Thêm
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* ================= RIGHT COLUMN (GIỎ HÀNG KHÓA KHUNG CUỘN) ================= */}
          <Col span={10} style={{ paddingRight: 0 }}>
            <Card
              style={{
                borderRadius: 12,
                height: "530px", // Cố định chiều cao cố định cho khung giỏ hàng
                display: "flex",
                flexDirection: "column",
              }}
              bodyStyle={{
                padding: 16,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Title level={4} style={{ marginBottom: 12 }}>
                <ShoppingCartOutlined /> Giỏ hàng ({selected.length})
              </Title>

              {/* Vùng chứa sản phẩm tự sinh thanh trượt mượt mà khi đầy */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 4,
                  marginBottom: 12,
                }}
              >
                {selected.length === 0 ? (
                  <div
                    style={{
                      color: "#999",
                      textAlign: "center",
                      paddingTop: 100,
                    }}
                  >
                    Chưa có sản phẩm
                  </div>
                ) : (
                  selected.map((item) => (
                    <Card
                      key={item.id}
                      size="small"
                      style={{
                        marginBottom: 12,
                        borderRadius: 10,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.01)",
                      }}
                    >
                      <Space align="start" style={{ width: "100%" }}>
                        <Image
                          src={item.hinhAnh}
                          width={50}
                          height={68}
                          style={{
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                          fallback="https://via.placeholder.com/50x68"
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              lineHeight: "16px",
                            }}
                          >
                            {item.tenSach}
                          </div>
                          <div
                            style={{
                              color: "#cf1322",
                              margin: "4px 0",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {item.gia?.toLocaleString()} đ
                          </div>
                          <Space
                            style={{
                              marginTop: 4,
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <InputNumber
                              min={1}
                              max={item.tonKho}
                              value={item.sl}
                              onChange={(v) => changeQty(item.id, v)}
                              style={{ width: 70 }}
                              size="small"
                            />
                            <Button
                              danger
                              size="small"
                              type="text"
                              onClick={() => removeCart(item.id)}
                              style={{ padding: "0 4px" }}
                            >
                              Xóa
                            </Button>
                          </Space>
                        </div>
                      </Space>
                    </Card>
                  ))
                )}
              </div>

              {/* Phần tổng tiền luôn bám chắc dưới đáy Card không bao giờ bị lệch vị trí */}
              <div style={{ marginTop: "auto" }}>
                <Divider style={{ margin: "12px 0" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    Tổng tiền
                  </Title>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#cf1322",
                      fontWeight: "bold",
                    }}
                  >
                    {total.toLocaleString()} đ
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* ================= DETAIL DRAWER ================= */}
      <Drawer
        title={
          <Space>
            <span>🧾 Chi tiết hóa đơn</span>
            <Tag color="blue" style={{ fontSize: 14 }}>
              #{detail?.id || ""}
            </Tag>
          </Space>
        }
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        width={650}
        extra={
          detail?.trangThai !== "HUY_DON" &&
          detail?.trangThai !== "DA_HUY" && (
            <Popconfirm
              title="Xác nhận hủy hóa đơn"
              description="Hành động này không thể hoàn tác. Bạn chắc chắn chứ?"
              onConfirm={() => cancelInvoice(detail?.id)}
              okText="Xác nhận hủy"
              cancelText="Đóng"
              okButtonProps={{ danger: true }}
              placement="bottomRight"
            >
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                style={{ borderRadius: 6 }}
              >
                Hủy hóa đơn
              </Button>
            </Popconfirm>
          )
        }
      >
        <Card
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            backgroundColor: "#fafafa",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={[16, 12]} style={{ padding: "8px 4px" }}>
            <Col span={12}>
              <Text type="secondary">Khách hàng:</Text>
              <div>
                <Text strong>
                  {detail?.khachHang?.hoTen || "Khách vãng lai"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mã KH:</Text>
              <div>
                <Tag color="cyan">#{detail?.khachHang?.id || "N/A"}</Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Nhân viên lập:</Text>
              <div>
                <Text>{detail?.nhanVien?.hoTen}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mã NV:</Text>
              <div>
                <Tag>#{detail?.nhanVien?.id}</Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Ngày bán:</Text>
              <div>
                <Text style={{ color: "#595959" }}>
                  {detail?.ngayBan
                    ? (() => {
                        const d = new Date(detail.ngayBan);
                        if (isNaN(d.getTime())) return detail.ngayBan;
                        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      })()
                    : ""}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Trạng thái:</Text>
              <div>
                <Tag
                  color={
                    detail?.trangThai === "HOAN_THANH"
                      ? "green"
                      : detail?.trangThai === "HUY_DON" ||
                          detail?.trangThai === "DA_HUY"
                        ? "red"
                        : "orange"
                  }
                  style={{ fontWeight: 500 }}
                >
                  {detail?.trangThai === "HOAN_THANH"
                    ? "Hoàn thành"
                    : detail?.trangThai === "HUY_DON" ||
                        detail?.trangThai === "DA_HUY"
                      ? "Đã hủy"
                      : detail?.trangThai}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        <Title level={5} style={{ marginBottom: 12, color: "#434343" }}>
          📦 Danh sách sản phẩm ({detail?.danhSachChiTiet?.length || 0})
        </Title>

        {(detail?.danhSachChiTiet || []).map((c) => (
          <Card
            key={c.id}
            style={{
              marginBottom: 12,
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Space align="start" size="middle" style={{ width: "100%" }}>
              <Image
                src={c.hinhAnh}
                width={64}
                height={84}
                style={{
                  borderRadius: 6,
                  objectFit: "cover",
                }}
                fallback="https://via.placeholder.com/64x84"
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#262626",
                  }}
                >
                  {c.tenSach}
                </div>

                <Row gutter={[8, 4]}>
                  <Col span={12}>
                    <Text type="secondary" size="small">
                      Số lượng:{" "}
                    </Text>
                    <Text strong>{c.soLuong}</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text type="secondary" size="small">
                      Đơn giá:{" "}
                    </Text>
                    <Text>{c.donGia?.toLocaleString()} đ</Text>
                  </Col>
                </Row>

                <Divider style={{ margin: "8px 0" }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thành tiền:
                  </Text>
                  <Text
                    style={{ color: "#cf1322", fontWeight: 700, fontSize: 15 }}
                  >
                    {c.thanhTien?.toLocaleString()} đ
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        ))}

        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            background: "#fff1f0",
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #ffa39e",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#a8071a" }}>
            Thành tiền cần thanh toán
          </Title>
          <Title
            level={3}
            style={{ margin: 0, color: "#cf1322", fontWeight: 800 }}
          >
            {detail?.tongTien?.toLocaleString()} đ
          </Title>
        </div>
      </Drawer>

      {/* ================= CREATE CUSTOMER MODAL ================= */}
      <Modal
        title="👤 Tạo khách hàng"
        open={openCustomer}
        onCancel={() => setOpenCustomer(false)}
        onOk={createCustomer}
        okText="Tạo"
        style={{
          top: 80,
        }}
      >
        <Form form={formCustomer} layout="vertical">
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[
              {
                required: true,
                message: "Nhập họ tên",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="sdt"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: "Nhập số điện thoại",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
