import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import '../widgets/resource_card.dart';

class TrendingScreen extends StatefulWidget {
  const TrendingScreen({super.key});

  @override
  State<TrendingScreen> createState() => _TrendingScreenState();
}

class _TrendingScreenState extends State<TrendingScreen> {
  bool _isLoading = true;
  List<Resource> _resources = [];

  @override
  void initState() {
    super.initState();
    _fetchTrending();
  }

  Future<void> _fetchTrending() async {
    try {
      final result = await ApiService.searchResources(
        category: 'shaders',
        page: 1,
        sortField: '6', // 6 = TotalDownloads
      );
      if (mounted) {
        setState(() {
          _resources = (result['resources'] as List<dynamic>?)?.cast<Resource>() ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF163320),
      appBar: AppBar(
        backgroundColor: const Color(0xFF163320),
        title: const Text('Trending Shaders', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF67D930)))
          : _resources.isEmpty
              ? const Center(child: Text('No trending items found.', style: TextStyle(color: Colors.white54)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _resources.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 24.0),
                      child: ResourceCardWidget(resource: _resources[index]),
                    );
                  },
                ),
    );
  }
}
