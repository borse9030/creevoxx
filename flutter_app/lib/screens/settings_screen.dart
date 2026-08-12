import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<void> _launchURL(BuildContext context, String urlString) async {
    final url = Uri.parse(urlString);
    try {
      final launched = await launchUrl(url, mode: LaunchMode.externalApplication);
      if (!launched) {
        // Fallback: try platformDefault mode (e.g. in-app WebView)
        await launchUrl(url, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open: $urlString')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF163320),
      appBar: AppBar(
        backgroundColor: const Color(0xFF163320),
        elevation: 0,
        title: const Text('Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSectionHeader('General'),
          _buildSettingsCard(
            context,
            icon: Icons.cleaning_services,
            title: 'Clear Cache',
            subtitle: 'Free up storage space',
            onTap: () async {
              try {
                // 1. Delete the SQLite API cache database
                final dbPath = await getDatabasesPath();
                final fullPath = p.join(dbPath, 'api_cache.db');
                await deleteDatabase(fullPath);

                // 2. Clear shared_preferences (favorites, downloads list)
                final prefs = await SharedPreferences.getInstance();
                await prefs.clear();

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Cache cleared! Restart the app to reload fresh content.'),
                      duration: Duration(seconds: 3),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Could not clear cache. Please try again.')),
                  );
                }
              }
            },
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('Legal'),
          _buildSettingsGroup(
            children: [
              _buildSettingsTile(
                icon: Icons.shield,
                title: 'Privacy Policy',
                subtitle: 'View our privacy policy',
                onTap: () => _launchURL(context, 'https://www.creevoxx.dev/privacy'),
              ),
              _buildSettingsTile(
                icon: Icons.gavel,
                title: 'Terms of Service',
                subtitle: 'View our terms of service',
                showDivider: false,
                onTap: () => _launchURL(context, 'https://www.creevoxx.dev/terms'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('Support'),
          _buildSettingsGroup(
            children: [
              _buildSettingsTile(
                icon: Icons.star,
                title: 'Rate App',
                subtitle: 'Love the app? Leave a review!',
                onTap: () => _launchURL(context, 'market://details?id=com.creevoxx.app'),
              ),
              _buildSettingsTile(
                icon: Icons.email,
                title: 'Contact Us',
                subtitle: 'Feedback & suggestions',
                onTap: () => _launchURL(context, 'mailto:realcreevoxx@gmail.com'),
                showDivider: false,
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Disclaimer card — visible to reviewers and users
          _buildDisclaimerCard(),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Widget _buildDisclaimerCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A2E1F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF67D930).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.info_outline, color: Color(0xFF67d930), size: 18),
              SizedBox(width: 8),
              Text(
                'Disclaimer',
                style: TextStyle(
                  color: Color(0xFF67d930),
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'MCPE Shaders and Textures is an unofficial, fan-made app and is not affiliated with, endorsed by, or sponsored by Mojang Studios or Microsoft. "Minecraft" is a registered trademark of Mojang Synergies AB.',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 12,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'This app links to resources hosted on CurseForge and other official creator pages. We do not host, redistribute, or claim ownership of any mod, shader, or texture pack.',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 12,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF67d930),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF223021),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF67D930).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF67d930)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsGroup({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF223021),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildSettingsTile({required IconData icon, required String title, String? subtitle, required VoidCallback onTap, bool showDivider = true}) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF67D930).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: const Color(0xFF67d930), size: 20),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500)),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                      ],
                    ],
                  ),
                ),
                const Icon(Icons.open_in_new, color: Colors.white24, size: 18),
              ],
            ),
          ),
          if (showDivider)
            const Divider(color: Colors.white12, height: 1, indent: 56),
        ],
      ),
    );
  }
}
