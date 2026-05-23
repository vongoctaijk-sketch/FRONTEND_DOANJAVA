import { Card, Input, Button, message } from "antd";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        username: username,
        password: password,
      });

      const token = res.data.token;

      const refreshToken = res.data.refreshToken;

      localStorage.setItem("token", token);

      localStorage.setItem("refreshToken", refreshToken);

      const payload = JSON.parse(atob(token.split(".")[1]));

      const currentUser = {
        id: payload.id,
        username: payload.sub,
        role: payload.role,
        permissions: payload.permissions,
      };

      localStorage.setItem("user", JSON.stringify(currentUser));

      message.success("Đăng nhập thành công");

      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);

      message.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card title="Login" style={{ width: 320 }}>
        <Input
          placeholder="Username"
          style={{ marginBottom: 10 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input.Password
          placeholder="Password"
          style={{ marginBottom: 10 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="primary" block onClick={handleLogin}>
          Đăng nhập
        </Button>
      </Card>
    </div>
  );
}

export default Login;
