import requests
import json

BASE_URL = 'https://expense-backend-1766329096.azurewebsites.net'

print('🔍 Testing Login...')
print()

login_data = {'username': 'john_doe', 'password': 'john123'}
response = requests.post(f'{BASE_URL}/api/auth/login', json=login_data)

print(f'Status: {response.status_code}')
if response.status_code == 200:
    result = response.json()
    print('✅ Login Successful!')
    print(json.dumps(result, indent=2))
else:
    print('❌ Failed:', response.text)
