#!/bin/bash

# Script para probar upload de SM

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbGRoMDhyZzAwMDBycDR1bW9wOW9rcmoiLCJlbWFpbCI6ImxpbmEuZ3IyMTAzQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MDg2MTcyNCwiZXhwIjoxNzcwODYyNjI0fQ.1ETDagIvm39fzF_5459gsF30OmE8MviWSD0R1UZcuNE"

echo "📤 Subiendo archivo test-sm.xlsx..."

curl -X POST http://localhost:3000/api/sm/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-sm.xlsx" \
  -v

echo ""
echo "✅ Test completado"
