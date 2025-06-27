import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [custom, setCustom] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [stats, setStats] = useState([]);

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
    }
  };

  const shorten = async () => {
    const res = await fetch("http://localhost:5000/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ originalUrl: url, customCode: custom }),
    });
    const data = await res.json();
    if (data.short) {
      setShortUrl(`http://localhost:5000/${data.short}`);
      fetchStats();
    }
  };

  const fetchStats = async () => {
    const res = await fetch("http://localhost:5000/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
  };

  if (!token)
    return (
      <div className="container">
        <h2>Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    );

  return (
    <div className="container">
      <h2>URL Shortener</h2>
      <input placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input placeholder="Custom shortcode (optional)" value={custom} onChange={(e) => setCustom(e.target.value)} />
      <button onClick={shorten}>Shorten</button>
      {shortUrl && <p>Shortened URL: <a href={shortUrl}>{shortUrl}</a></p>}

      <h3>Statistics</h3>
      <table>
        <thead>
          <tr>
            <th>Short</th>
            <th>Original</th>
            <th>Clicks</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr key={i}>
              <td><a href={`http://localhost:5000/${s.short}`}>{s.short}</a></td>
              <td>{s.original}</td>
              <td>{s.clicks}</td>
              <td>{new Date(s.expiry).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;