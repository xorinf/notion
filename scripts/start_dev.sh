#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
osascript -e 'tell app "Terminal" to do script "cd '$DIR'/../frontend && npm run dev"'
osascript -e 'tell app "Terminal" to do script "cd '$DIR'/../backend && nodemon server.js"'
open http://localhost:5173