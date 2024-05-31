apt-get update && apt-get install git

npm install -g pnpm

echo "Install dependencies..."
pnpm install

echo "Build the project..."
pnpm build

echo "Start the server..."
pnpm start
