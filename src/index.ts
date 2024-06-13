/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
	HELIUS_WEBHOOK_AUTH_HEADER: string,
	AWS_SWAP_PROCESSOR: string,
	ENABLED: boolean,
}

export default {
	async fetch(request: Request, env: Env) {
		try {
			const resolvedRequest = await request.json();
			console.log(`Request received: ${JSON.stringify(resolvedRequest, null, 2)}`)
			const authHeader = request.headers.get('Authorization');
			if(request.method === 'POST' && authHeader === env.HELIUS_WEBHOOK_AUTH_HEADER){
				if(env.ENABLED === true){
					console.log(`Sending request to processor`);
					fetch(env.AWS_SWAP_PROCESSOR, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': authHeader
						},
						body: JSON.stringify(resolvedRequest)
					});
					await sleep(2000);
					return new Response(`Sent!`, { status: 200 });
				}
			}
			return new Response(`Not Enabled`, { status: 400 });
		}catch(e){
			return new Response(`Error: ${JSON.stringify(e, null, 2)}`, { status: 500 });
		}
	},
};

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}