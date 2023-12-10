# production env file must be make self
PORT=7700 pm2 start "node -r dotenv/config build" --name bdr