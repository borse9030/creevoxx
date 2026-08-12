import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  const String baseUrl = 'https://www.creevoxx.dev/api';
  const Map<String, String> headers = {
    'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11',
  };

  final Uri url = Uri.parse('$baseUrl/search').replace(queryParameters: {
    'category': 'all',
    'index': '0',
    'pageSize': '20',
    'edition': 'bedrock',
    'sortField': '2',
    'categoryId': '11332',
  });

  print('Fetching: $url');
  
  try {
    final response = await http.get(url, headers: headers);
    print('Status: ${response.statusCode}');
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List items = data['data'];
      print('Count: ${items.length}');
      if (items.isNotEmpty) {
        print('First item: ${items[0]['title']}');
      }
    } else {
      print('Error: ${response.body}');
    }
  } catch (e) {
    print('Exception: $e');
  }
}
