# Simple Vending Machine API

A lightweight REST API for teaching React. Uses a local JSON file for persistence.

## Features

- **Auth:** JWT-based login (User: `admin`, Pass: `passwd123`)
- **Machines:** List and view vending machines.
- **Items:** Edit items within a machine.
- **Storage:** Persists data to `db.json`.

## Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Returns JWT token | No |
| `GET` | `/machines` | List all machines | Yes |
| `GET` | `/machines/:id` | Get specific machine | Yes |
| `PUT` | `/machines/:id/items` | Update items array | Yes |
| `POST` | `/machines` | Create new machine | Yes |

## Quick Start

1. `npm install`
2. `npm start`
3. API runs on `http://localhost:3000`

## Deployment

Deploy easily to **Render.com** or **Glitch.com**.
