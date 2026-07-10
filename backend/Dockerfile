FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV MONGODB_URI=mongodb+srv://skinternationallaw:AXCFFXuph6rSisNP@cluster0.9oxkzrs.mongodb.net/dashboard_builder

CMD ["npm", "start"]
