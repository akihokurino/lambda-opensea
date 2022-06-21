FROM public.ecr.aws/lambda/nodejs:16
COPY build/index.js node_modules ./
CMD ["index.handler"]