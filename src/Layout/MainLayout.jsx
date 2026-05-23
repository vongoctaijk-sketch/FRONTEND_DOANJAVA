import React from "react";
import { useState } from "react";
import { Layout } from "antd";
import { Button } from "antd";
import Sidebar from "../Component/Sidebar";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import Topbar from "../Component/Topbar";
import { Outlet } from "react-router-dom";
const { Sider, Header, Content } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="Sider"
      >
        <Sidebar></Sidebar>
        <Button
          type="text"
          icon={collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="collapsedicon"
        />
      </Sider>
      <Layout>
        <Header
          className="header"
          style={{
            padding: 0,
            background: "#fff",
            height: 72,
            lineHeight: "72px",
          }}
        >
          <Topbar />
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
