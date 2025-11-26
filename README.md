# Instructions

### 1. Deploy the Mock Orders API
```shell
 kubectl apply -f api/k8s-manifest.yaml
```


### 2. Deploy the Chat UI and Agent
Update the agent/k8s-manifest.yaml to reflect your deployment. There are 2 variables in particular which may need to be updated. You will need to use the service name for your Kong data plane. For example, if your LoadBalancer is named `mcp-control-plane-loadbalancer` the entires should look as follows:

```
  PROXY_BASE_URL: "http://mcp-control-plane-loadbalancer.kong.svc.cluster.local:8080/chat"
  MCP_SERVER_URL: "http://mcp-control-plane-loadbalancer.kong.svc.cluster.local:8080/marketplace"
```

Once these have been updates, apply the agent manifest:

```shell
 kubectl apply -f agent/k8s-manifest.yaml
```

### 3. 
Edit the `deck/kong.yaml` file, updating the `control_plane_name` to match your deployment. Apply the config as follows:

```shell
 deck gateway sync deck/kong.yanl
```

In the Konnect UI, navigate to your contol plane (API GateWay -> <your control plane name>), then navigate to your Vault (Vaults -> mcpvault) and add a secret named `openai-key` with a value of
```
Bearer <your open ai secret>
```

Please note that this example is set up for OpenAi, you will need to adjust the deck config/secret to reflect your specific provider. 