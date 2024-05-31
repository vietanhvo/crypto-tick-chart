npm install -g pnpm
pnpm config set store-dir /home/node/.local/share/pnpm/store

echo "Install dependencies..."
pnpm install

echo "Build the project..."
pnpm build

echo "Start the server..."
pnpm start
