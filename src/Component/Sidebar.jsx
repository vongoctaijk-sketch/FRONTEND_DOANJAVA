import { Flex, Menu } from "antd";

import {
  ReadOutlined,
  DashboardOutlined,
  UserOutlined,
  TagsOutlined,
  BookOutlined,
  ImportOutlined,
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Flex align="center" justify="center">
        <div className="logo">
          <ReadOutlined />
        </div>
      </Flex>

      <Menu
        mode="inline"
        className="menu"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          {
            key: "/dashboard",
            icon: <DashboardOutlined />,
            label: "Trang chủ",
          },

          {
            key: "/author",
            icon: <UserOutlined />,
            label: "Tác giả",
          },

          {
            key: "/category",
            icon: <TagsOutlined />,
            label: "Thể loại",
          },

          {
            key: "/book",
            icon: <BookOutlined />,
            label: "Sách",
          },

          {
            key: "/import",
            icon: <ImportOutlined />,
            label: "Phiếu nhập",
          },

          {
            key: "/invoice",
            icon: <FileTextOutlined />,
            label: "Hóa đơn",
          },

          {
            key: "/customer",
            icon: <TeamOutlined />,
            label: "Khách hàng",
          },

          {
            key: "/receipt",
            icon: <DollarOutlined />,
            label: "Phiếu thu",
          },

          {
            key: "/report",
            icon: <BarChartOutlined />,
            label: "Báo cáo",
          },

          {
            key: "/config",
            icon: <SettingOutlined />,
            label: "Cấu hình",
          },
        ]}
      />
    </>
  );
}

export default Sidebar;
