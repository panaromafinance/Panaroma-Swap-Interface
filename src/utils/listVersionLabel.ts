import { Version } from "@panaromafinance/panaromaswap_v1tokenlist";

export default function listVersionLabel(version: Version): string {
  return `v${version.major}.${version.minor}.${version.patch}`;
}
