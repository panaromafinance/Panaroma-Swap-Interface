import { Trans } from "@lingui/macro";
import { sendEvent } from "components/analytics";
import React, { ErrorInfo, PropsWithChildren } from "react";
import styled from "styled-components/macro";

import store, { AppState } from "../../state";
import {
  //  ExternalLink, 
  ThemedText
} from "../../theme";
import { userAgent } from "../../utils/userAgent";
import { AutoColumn } from "../Column";
// import { AutoRow } from "../Row";
import { ButtonPrimary } from "../../components/Button";
import ErrorImg from "../../assets/images/bg-404.png"
// import ErrorImg from "../../assets/images/InviteFriends.png"


const FallbackWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  z-index: 1;
`;

const BodyWrapper = styled.div<{ margin?: string }>`
  padding: 1rem;
  width: 100%;
  white-space: ;
`;

const CodeBlockWrapper = styled.div`
  background: ${({ theme }) => theme.deprecated_bg0};
  overflow: auto;
  white-space: pre;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  padding: 18px 24px;
  color: ${({ theme }) => theme.deprecated_text1};
`;

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.deprecated_blue1};
  padding: 6px 24px;
`;

const SomethingWentWrongWrapper = styled.div`
  padding: 6px 24px;
  text-align: center;
`;

type ErrorBoundaryState = {
  error: Error | null;
};

const IS_PANAROMASWAP = window.location.hostname === "app.panaromaswap.org";

async function updateServiceWorker(): Promise<ServiceWorkerRegistration> {
  const ready = await navigator.serviceWorker.ready;
  // the return type of update is incorrectly typed as Promise<void>. See
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
  return ready.update() as unknown as Promise<ServiceWorkerRegistration>;
}

export default class ErrorBoundary extends React.Component<
  PropsWithChildren<unknown>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<unknown>) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    updateServiceWorker()
      .then(async (registration) => {
        // We want to refresh only if we detect a new service worker is waiting to be activated.
        // See details about it: https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
        if (registration?.waiting) {
          await registration.unregister();

          // Makes Workbox call skipWaiting(). For more info on skipWaiting see: https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
          registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // Once the service worker is unregistered, we can reload the page to let
          // the browser download a fresh copy of our app (invalidating the cache)
          window.location.reload();
        }
      })
      .catch((error) => {
        console.error("Failed to update service worker", error);
      });
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    sendEvent("exception", {
      description: error.toString() + errorInfo.toString(),
      fatal: true
    });
  }

  render() {
    const { error } = this.state;

    if (error !== null) {
      const encodedBody = encodeURIComponent(issueBody(error));
      return (
        <FallbackWrapper>
          <BodyWrapper className="vh-100 d-flex align-items-center justify-content-center">
            <AutoColumn gap={"md"}>
              <img src={ErrorImg} className="w-50 m-auto" />
              <SomethingWentWrongWrapper>
                {/* <Routes>
                <Route path="test" element={<Swap />} /> */}

                <ThemedText.DeprecatedLabel fontSize={24} fontWeight={600}>
                  {/* <Trans>Something went wrong</Trans> */}
                  <Trans>Sorry! We encountered an unexpected error.</Trans>
                  {/* {error.stack} */}
                </ThemedText.DeprecatedLabel>
                <Trans>Please try again after some time.</Trans>
                <a onClick={() => { window.location.href = '/#/swap'; window.location.reload() }}>
                  <ButtonPrimary className="w-50 align-self-center my-3 mx-auto">
                    <Trans>Click here to go to Home</Trans>
                  </ButtonPrimary>
                </a>
                {/* </Routes> */}
              </SomethingWentWrongWrapper>
              {/* <CodeBlockWrapper>
                <code>
                  <ThemedText.DeprecatedMain fontSize={10}>
                    {error.stack}
                  </ThemedText.DeprecatedMain>
                </code>
              </CodeBlockWrapper> */}
              {/* {IS_PANAROMASWAP ? ( */}
              {/* <AutoRow>
                  <LinkWrapper>
                    <ExternalLink
                      id="create-github-issue-link"
                      href={`https://github.com/Panaromaswap/panaromaswap-interface/issues/new?assignees=&labels=bug&body=${encodedBody}&title=${encodeURIComponent(
                        `Crash report: \`${error.name}${
                          error.message && `: ${error.message}`
                        }\``
                      )}`}
                      target="_blank">
                      <ThemedText.DeprecatedLink fontSize={16}>
                        <Trans>Create an issue on GitHub</Trans>
                        <span>↗</span>
                      </ThemedText.DeprecatedLink>
                    </ExternalLink>
                  </LinkWrapper>
                  <LinkWrapper>
                    <ExternalLink
                      id="get-support-on-discord"
                      href="https://discord.gg/FCfyBSbCU5"
                      target="_blank">
                      <ThemedText.DeprecatedLink fontSize={16}>
                        <Trans>Get support on Discord</Trans>
                        <span>↗</span>
                      </ThemedText.DeprecatedLink>
                    </ExternalLink>
                  </LinkWrapper>
                </AutoRow> */}
              {/* ) : null} */}
            </AutoColumn>
          </BodyWrapper>
        </FallbackWrapper>
      );
    }
    return this.props.children;
  }
}

function getRelevantState(): null | keyof AppState {
  const path = window.location.hash;
  if (!path.startsWith("#/")) {
    return null;
  }
  const pieces = path.substring(2).split(/[/\\?]/);
  switch (pieces[0]) {
    case "swap":
      return "swap";
    case "add":
      if (pieces[1] === "v1") return "mint";
      else return "mintV2edge";
    case "remove":
      if (pieces[1] === "v1") return "burn";
      else return "burnV2edge";
  }
  return null;
}
// function test() {
//   debugger
// }

function issueBody(error: Error): string {
  const relevantState = getRelevantState();
  const deviceData = userAgent;
  return `## URL
  
${window.location.href}

${relevantState
      ? `## \`${relevantState}\` state
    
\`\`\`json
${JSON.stringify(store.getState()[relevantState], null, 2)}
\`\`\`
`
      : ""
    }
${error.name &&
    `## Error

\`\`\`
${error.name}${error.message && `: ${error.message}`}
\`\`\`
`
    }
${error.stack &&
    `## Stacktrace

\`\`\`
${error.stack}
\`\`\`
`
    }
${deviceData &&
    `## Device data

\`\`\`json
${JSON.stringify(deviceData, null, 2)}
\`\`\`
`
    }
`;
}
