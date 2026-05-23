import {
  Layout,
  Space,
  Badge,
  Avatar,
  Typography,
  Dropdown,
  Button,
} from "antd";

import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

export default function Topbar() {
  const menuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "2",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "3",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Space size="middle">
        {/* Notification */}
        <Badge count={5} size="small">
          <Button
            type="text"
            shape="circle"
            icon={
              <BellOutlined
                style={{
                  fontSize: 20,
                }}
              />
            }
          />
        </Badge>

        {/* User */}
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space
            style={{
              cursor: "pointer",
            }}
          >
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                background: "#1677ff",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.2,
              }}
            >
              <Text strong>Admin</Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Quản trị viên
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
