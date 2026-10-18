import { AddressPublisher } from "./AddressPublisher.jsx";
import { GatewayLanding } from "./GatewayLanding.jsx";
import { selectPageConfig } from "./config.js";

export function App() {
  const config = selectPageConfig();
  return config.id === "gateway" ? <GatewayLanding config={config} /> : <AddressPublisher config={config} />;
}
