import { StackContext, Function } from "sst/constructs"

export function API({ stack }: StackContext) {
  const lambda = new Function(stack, "trpcLambda", {
    handler: "packages/functions/src/index.main",
    timeout: 15,
    memorySize: 1024,
    url: true,
    environment: { DATABASE_URL: process.env.DATABASE_URL! },
  })

  stack.addOutputs({
    lambdaUrl: lambda.url,
  })
}
