import { StackContext, Function } from "sst/constructs"

export function API({ stack }: StackContext) {
  const lambda = new Function(stack, "trpcLambda", {
    handler: "packages/functions/src/index.main",
    timeout: 15,
    memorySize: 1024,
    url: true,
    environment: { DATABASE_URL: process.env.DATABASE_URL! },
    nodejs: { esbuild: { external: ["@prisma/client", ".prisma"] } },
    copyFiles: [
      {
        from: "packages/functions/prisma/schema.prisma",
        to: "packages/functions/src/schema.prisma",
      },
      {
        from: "node_modules/prisma/libquery_engine-linux-arm64-openssl-1.0.x.so.node",
        to: "packages/functions/src/libquery_engine-linux-arm64-openssl-1.0.x.so.node",
      },
    ],
  })

  stack.addOutputs({
    lambdaUrl: lambda.url,
  })
}
