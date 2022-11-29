import { ColumnValue, Connection, ConnectionConfig, Request } from "tedious";

const sqlConfig = {
  user: "hotel",
  password: "L4=5:\\k]7TmL\"mJz'Q",
  database: "Hotel",
  server: "192.168.10.46",
  options: {
    trustServerCertificate: true,
  },
};

export default sqlConfig;
