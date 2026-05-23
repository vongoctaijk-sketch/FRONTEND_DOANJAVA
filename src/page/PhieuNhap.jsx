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
  Select,
} from "antd";

import {
  PlusOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import Api from "../Api/axios";

const { Title, Text } = Typography;
const { Option } = Select;

export default function PurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [detail, setDetail] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [searchBook, setSearchBook] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formSupplier] = Form.useForm();

  useEffect(() => {
    fetchPurchaseOrders();
    fetchBooks();
    fetchSuppliers();
    loadCurrentUser();
  }, []);

  /* ================= USER / AUTH ================= */
  const loadCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  const resetCart = () => {
    setSelectedBooks([]);
    setSelectedSupplierId(null);
    setSearchBook("");
  };

  /* ================= LOAD DATA API ================= */
  const fetchPurchaseOrders = async () => {
    try {
      const res = await Api.get("/api/phieu-nhap");
      const data =
        res.data?.data ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);
      setPurchaseOrders(data);
    } catch {
      setPurchaseOrders([]);
      message.error("Lỗi tải danh sách phiếu nhập");
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
      message.error("Lỗi tải danh sách sách");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await Api.get("/api/nha-cung-cap");
      const data =
        res.data?.data ||
        res.data?.content ||
        (Array.isArray(res.data) ? res.data : []);
      setSuppliers(data);
    } catch {
      setSuppliers([]);
    }
  };

  /* ================= DELETE ORDER API ================= */
  const deletePurchaseOrder = async (id) => {
    try {
      await Api.delete(`/api/phieu-nhap/${id}`);
      message.success("Đã xóa phiếu nhập thành công");
      fetchPurchaseOrders();
      if (detail && detail.id === id) {
        setOpenDetail(false);
      }
    } catch {
      message.error("Xóa phiếu nhập thất bại");
    }
  };

  /* ================= BOOK SELECTION ================= */
  const toggleBook = (b) => {
    const ex = selectedBooks.find((x) => x.id === b.id);
    if (ex) {
      setSelectedBooks(selectedBooks.filter((x) => x.id !== b.id));
    } else {
      setSelectedBooks([
        ...selectedBooks,
        {
          id: b.id,
          tenSach: b.tenSach,
          giaNhap: b.giaNhap || b.giaBan * 0.6 || 50000,
          sl: 1,
          hinhAnh: b.hinhAnh,
          tonKho: b.soLuongTon,
        },
      ]);
    }
  };

  const changeQty = (id, sl) => {
    setSelectedBooks(
      selectedBooks.map((x) => (x.id === id ? { ...x, sl: sl || 1 } : x)),
    );
  };

  const changePrice = (id, price) => {
    setSelectedBooks(
      selectedBooks.map((x) =>
        x.id === id ? { ...x, giaNhap: price || 0 } : x,
      ),
    );
  };

  const removeCart = (id) => {
    setSelectedBooks(selectedBooks.filter((x) => x.id !== id));
  };

  /* ================= TOTAL CALCULATION ================= */
  const totalCost = useMemo(() => {
    return selectedBooks.reduce((a, b) => a + b.giaNhap * b.sl, 0);
  }, [selectedBooks]);

  /* ================= SUPPLIER ACTIONS ================= */
  const selectedSupplierInfo = useMemo(() => {
    return suppliers.find((x) => x.id === selectedSupplierId);
  }, [selectedSupplierId, suppliers]);

  const createSupplier = async () => {
    try {
      const v = await formSupplier.validateFields();
      const res = await Api.post("/api/nha-cung-cap", {
        tenNCC: v.tenNCC,
        sdt: v.sdt,
        diaChi: v.diaChi,
      });

      const newSupplier = res.data?.data || res.data;
      setSuppliers((prev) => [...prev, newSupplier]);
      setSelectedSupplierId(newSupplier.id);
      setOpenSupplier(false);
      formSupplier.resetFields();
      message.success("Thêm nhà cung cấp thành công");
    } catch {
      message.error("Lỗi tạo nhà cung cấp");
    }
  };

  /* ================= CREATE PURCHASE ORDER ================= */
  const handleCreateOrder = async () => {
    if (selectedBooks.length === 0) {
      message.warning("Chưa chọn sản phẩm nhập kho");
      return;
    }
    if (!selectedSupplierId) {
      message.warning("Vui lòng lựa chọn nhà cung cấp");
      return;
    }
    if (!currentUser?.id) {
      message.error("Không tìm thấy ID nhân viên đang đăng nhập");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nhaCungCapId: selectedSupplierId,
        nhanVienId: Number(currentUser?.id),
        list: selectedBooks.map((x) => ({
          sachId: x.id,
          soLuongNhap: x.sl,
          giaNhap: x.giaNhap,
        })),
      };

      await Api.post("/api/phieu-nhap", payload);
      message.success("Tạo phiếu nhập kho thành công");
      resetCart();
      setOpenCreate(false);
      fetchPurchaseOrders();
      fetchBooks();
    } catch (e) {
      message.error(e?.response?.data?.message || "Lỗi lưu phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredBooks = books.filter((b) =>
    b.tenSach?.toLowerCase().includes(searchBook.toLowerCase()),
  );

  const filteredOrders = purchaseOrders.filter((x) =>
    String(x.id || "")
      .toLowerCase()
      .includes(searchOrder.toLowerCase()),
  );

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "Mã Phiếu",
      dataIndex: "id",
      width: 120,
      render: (v) => (
        <Tag color="purple" style={{ fontWeight: 600, padding: "2px 8px" }}>
          #PN{v}
        </Tag>
      ),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "nhaCungCap",
      render: (ncc) => (
        <Text strong style={{ color: "#36cfc9" }}>
          <ShopOutlined /> {ncc?.tenNCC || "N/A"}
        </Text>
      ),
    },
    {
      title: "Ngày nhập kho",
      dataIndex: "ngayNhap",
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
      title: "Tổng tiền nhập",
      dataIndex: "tongTien",
      render: (v) => (
        <span
          style={{ color: "#722ed1", fontWeight: "bold", fontSize: "15px" }}
        >
          {v?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Thao tác",
      width: 140,
      align: "center",
      render: (_, r) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết phiếu">
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

          <Popconfirm
            title="Xóa phiếu nhập"
            description="Bạn có chắc chắn muốn xóa vĩnh viễn phiếu nhập này?"
            onConfirm={() => deletePurchaseOrder(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            placement="topRight"
          >
            <Tooltip title="Xóa dữ liệu">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                size="middle"
                ghost
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f6fa", minHeight: "100vh" }}>
      {/* ================= HEADER CONTROL BAR ================= */}
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
              📦 Quản lý nhập kho (Phiếu Nhập)
            </Title>
          </Col>
          <Col>
            <Space size="middle">
              <Input
                placeholder="Tìm kiếm mã phiếu nhập..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                style={{ width: 240, borderRadius: 8 }}
              />
              <DatePicker style={{ borderRadius: 8 }} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenCreate(true)}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  backgroundColor: "#1677ff",
                  borderColor: "#1677ff",
                }}
              >
                Nhập hàng kho
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ================= DATA TABLE ================= */}
      <Card
        style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* ================= CREATE MODAL (GIỎ HÀNG NHẬP) ================= */}
      <Modal
        title="📥 Lập phiếu nhập kho hàng"
        open={openCreate}
        onCancel={() => {
          setOpenCreate(false);
          resetCart();
        }}
        onOk={handleCreateOrder}
        width={1000} // Thu nhỏ chiều rộng tổng thể modal cho cân đối
        confirmLoading={loading}
        centered
        okText="Hoàn tất nhập kho"
        okButtonProps={{
          style: { backgroundColor: "#722ed1", borderColor: "#722ed1" },
        }}
        bodyStyle={{ padding: "12px 0 0 0" }}
      >
        {/* Khống chế chiều cao tổng và ẩn phần overflow ngang ngoài ý muốn */}
        <Row
          gutter={20}
          style={{
            maxHeight: "72vh",
            overflowY: "auto",
            overflowX: "hidden",
            margin: 0,
          }}
        >
          {/* LEFT CONTENT AREA */}
          <Col span={14} style={{ paddingLeft: 0 }}>
            {/* CHOOSE SUPPLIER CARD */}
            <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  <ShopOutlined /> Nhà cung cấp đối tác
                </Title>
                <Space.Compact style={{ width: "100%" }}>
                  <Select
                    showSearch
                    placeholder="Chọn nhà cung cấp sách..."
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={selectedSupplierId}
                    onChange={(val) => setSelectedSupplierId(val)}
                  >
                    {suppliers.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.tenNCC} - {s.sdt}
                      </Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenSupplier(true)}
                    style={{
                      backgroundColor: "#722ed1",
                      borderColor: "#722ed1",
                    }}
                  >
                    Thêm NCC
                  </Button>
                </Space.Compact>

                {selectedSupplierInfo && (
                  <Card
                    size="small"
                    style={{
                      marginTop: 8,
                      borderRadius: 8,
                      background: "#f9f0ff",
                    }}
                  >
                    <Space direction="vertical" size={2}>
                      <div>
                        <b>Tên đối tác:</b> {selectedSupplierInfo.tenNCC}
                      </div>
                      <div>
                        <b>Số điện thoại:</b> {selectedSupplierInfo.sdt}
                      </div>
                      <div>
                        <b>Địa chỉ trụ sở:</b> {selectedSupplierInfo.diaChi}
                      </div>
                    </Space>
                  </Card>
                )}
              </Space>
            </Card>

            {/* BOOK SELECTION LIST CARD */}
            <Card size="small" style={{ borderRadius: 12 }}>
              <Input
                placeholder="Tìm sách cần nhập kho..."
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                style={{ marginBottom: 14 }}
              />
              <Table
                size="small"
                rowKey="id"
                dataSource={filteredBooks}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 280 }} // Chỉnh lại chiều cao bảng sách bên trái cho cân xứng
                columns={[
                  {
                    title: "Sách",
                    render: (_, r) => (
                      <Space align="start">
                        <Image
                          src={r.hinhAnh}
                          width={50}
                          height={68}
                          style={{ borderRadius: 6, objectFit: "cover" }}
                          fallback="https://via.placeholder.com/50x68"
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.tenSach}</div>
                          <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                            Hiện tại tồn: {r.soLuongTon}
                          </div>
                        </div>
                      </Space>
                    ),
                  },
                  {
                    title: "Giá bán niêm yết",
                    dataIndex: "giaBan",
                    width: 130,
                    render: (v) => `${v?.toLocaleString()} đ`,
                  },
                  {
                    title: "Action",
                    width: 80,
                    render: (_, r) => (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => toggleBook(r)}
                        style={{
                          backgroundColor: "#722ed1",
                          borderColor: "#722ed1",
                        }}
                      >
                        Chọn
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* RIGHT BASKET AREA (GIỎ HÀNG KHÓA CỐ ĐỊNH) */}
          <Col span={10} style={{ paddingRight: 0 }}>
            <Card
              style={{
                borderRadius: 12,
                height: "530px", // Ép chiều cao cố định giống hệt hóa đơn
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
              <Title level={4} style={{ color: "#722ed1", marginBottom: 12 }}>
                <ShoppingCartOutlined /> Danh sách hàng nhập (
                {selectedBooks.length})
              </Title>

              {/* Phân vùng scroll nội bộ độc lập */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 4,
                  marginBottom: 12,
                }}
              >
                {selectedBooks.length === 0 ? (
                  <div
                    style={{
                      color: "#999",
                      textAlign: "center",
                      paddingTop: 100,
                    }}
                  >
                    Chưa chọn mặt hàng nào để nhập kho
                  </div>
                ) : (
                  selectedBooks.map((item) => (
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
                          style={{ borderRadius: 6, objectFit: "cover" }}
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

                          <Row gutter={8} style={{ marginTop: 6 }}>
                            <Col span={13}>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#8c8c8c",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                Giá Nhập (đ):
                              </span>
                              <InputNumber
                                min={0}
                                value={item.giaNhap}
                                onChange={(val) => changePrice(item.id, val)}
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Col>
                            <Col span={11}>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#8c8c8c",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                S.Lượng:
                              </span>
                              <InputNumber
                                min={1}
                                value={item.sl}
                                onChange={(val) => changeQty(item.id, val)}
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Col>
                          </Row>

                          <div style={{ textAlign: "right", marginTop: 8 }}>
                            <Button
                              danger
                              size="small"
                              type="text"
                              onClick={() => removeCart(item.id)}
                              style={{ padding: "0 4px" }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  ))
                )}
              </div>

              {/* Giữ khối tính tiền cố định bám sát đáy thẻ Card */}
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
                    Tổng vốn đầu tư
                  </Title>
                  <Title
                    level={4}
                    style={{ margin: 0, color: "#722ed1", fontWeight: "bold" }}
                  >
                    {totalCost.toLocaleString()} đ
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
            <span>🧾 Chi tiết phiếu nhập kho</span>
            <Tag color="purple" style={{ fontSize: 14 }}>
              #PN{detail?.id || ""}
            </Tag>
          </Space>
        }
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        width={650}
        extra={
          <Popconfirm
            title="Xác nhận xóa phiếu"
            description="Hành động này sẽ xóa dữ liệu vĩnh viễn kho hàng. Tiếp tục?"
            onConfirm={() => deletePurchaseOrder(detail?.id)}
            okText="Xác nhận xóa"
            cancelText="Đóng"
            okButtonProps={{ danger: true }}
            placement="bottomRight"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa phiếu nhập
            </Button>
          </Popconfirm>
        }
      >
        <Card
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            backgroundColor: "#fafafa",
          }}
        >
          <Row gutter={[16, 12]} style={{ padding: "8px 4px" }}>
            <Col span={12}>
              <Text type="secondary">Nhà cung cấp đối tác:</Text>
              <div>
                <Text strong>{detail?.nhaCungCap?.tenNCC}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mã NCC:</Text>
              <div>
                <Tag color="cyan">#{detail?.nhaCungCap?.id}</Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Nhân viên kho:</Text>
              <div>
                <Text>
                  {detail?.nhanVien?.hoTen ||
                    detail?.nhanVienNguoiDung?.hoTen ||
                    "Kho quản trị viên"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mã NV:</Text>
              <div>
                <Tag>#{detail?.nhanVien?.id || "N/A"}</Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Thời gian nhập:</Text>
              <div>
                <Text style={{ color: "#595959" }}>
                  {detail?.ngayNhap
                    ? (() => {
                        const d = new Date(detail.ngayNhap);
                        if (isNaN(d.getTime())) return detail.ngayNhap;
                        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      })()
                    : ""}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Title level={5} style={{ marginBottom: 12 }}>
          📦 Danh sách mặt hàng chi tiết ({detail?.danhSachChiTiet?.length || 0}
          )
        </Title>

        {(detail?.danhSachChiTiet || []).map((c) => (
          <Card
            key={c.id}
            style={{ marginBottom: 12, borderRadius: 12 }}
            bodyStyle={{ padding: 12 }}
          >
            <Space align="start" size="middle" style={{ width: "100%" }}>
              <Image
                src={c.hinhAnh || (c.sach && c.sach.hinhAnh)}
                width={64}
                height={84}
                style={{ borderRadius: 6, objectFit: "cover" }}
                fallback="https://via.placeholder.com/64x84"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {c.tenSach || (c.sach && c.sach.tenSach) || "Sách đối tác"}
                </div>
                <Row gutter={[8, 4]}>
                  <Col span={12}>
                    <Text type="secondary">Số lượng nhập: </Text>
                    <Text strong>{c.soLuong || c.soLuongNhap}</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Text type="secondary">Đơn giá nhập: </Text>
                    <Text>{c.giaNhap?.toLocaleString()} đ</Text>
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
                  <Text type="secondary">Tổng chi phí:</Text>
                  <Text
                    style={{ color: "#722ed1", fontWeight: 700, fontSize: 15 }}
                  >
                    {(
                      (c.soLuong || c.soLuongNhap) * c.giaNhap
                    )?.toLocaleString()}{" "}
                    đ
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
            background: "#f9f0ff",
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #d3adf7",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#531dab" }}>
            Tổng dòng vốn thanh toán
          </Title>
          <Title
            level={3}
            style={{ margin: 0, color: "#722ed1", fontWeight: 800 }}
          >
            {detail?.tongTien?.toLocaleString()} đ
          </Title>
        </div>
      </Drawer>

      {/* ================= CREATE SUPPLIER POPUP ================= */}
      <Modal
        title="🏢 Thêm mới Nhà Cung Cấp đối tác"
        open={openSupplier}
        onCancel={() => setOpenSupplier(false)}
        onOk={createSupplier}
        okText="Tạo đối tác"
      >
        <Form form={formSupplier} layout="vertical">
          <Form.Item
            name="tenNCC"
            label="Tên nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ví dụ: Nhà sách Tuổi Trẻ"
            />
          </Form.Item>

          <Form.Item
            name="sdt"
            label="Số điện thoại liên hệ"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Ví dụ: 0912345678" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ trụ sở chính">
            <Input placeholder="Nhập địa chỉ nhà cung cấp..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
