import json

hpp_json_path = r"C:\Users\ahmad\Downloads\testing\tiktok_revenue_hpp_sku_1782753741932.json"
with open(hpp_json_path, 'r', encoding='utf-8') as f:
    hpp_data = json.load(f)

target = "1734517677830407508"
if target in hpp_data:
    print(f"Key {target} is in HPP JSON! Value: {hpp_data[target]}")
else:
    print(f"Key {target} NOT in HPP JSON!")

# Check if there are other keys starting with '1734517'
print("\nChecking keys starting with '1734517':")
for k, v in hpp_data.items():
    if k.startswith('1734517'):
        print(f"  - Key: {k}, Value: {v}")
