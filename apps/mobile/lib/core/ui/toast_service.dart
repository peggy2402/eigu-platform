import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'dart:ui';

class ToastService {
  static final FToast fToast = FToast();

  static void init(BuildContext context) {
    fToast.init(context);
  }

  static void show(String title, {String? description, String type = 'info'}) {
    Color bgColor;
    Color borderColor;
    Color iconColor;
    IconData iconData;
    
    switch (type) {
      case 'success': 
        iconColor = const Color(0xFF22C55E); 
        bgColor = const Color(0x6622C55E); 
        borderColor = const Color(0xCC22C55E); 
        iconData = Icons.check; 
        break;
      case 'error': 
        iconColor = const Color(0xFFEF4444); 
        bgColor = const Color(0x66EF4444); 
        borderColor = const Color(0xCCEF4444); 
        iconData = Icons.close; 
        break;
      case 'warning': 
        iconColor = const Color(0xFFF59E0B); 
        bgColor = const Color(0x66F59E0B); 
        borderColor = const Color(0xCCF59E0B); 
        iconData = Icons.warning_amber; 
        break;
      default: 
        iconColor = const Color(0xFF3B82F6); 
        bgColor = const Color(0x663B82F6); 
        borderColor = const Color(0xCC3B82F6); 
        iconData = Icons.info_outline; 
        break;
    }

    Widget toast = Container(
      margin: const EdgeInsets.only(top: 16, left: 16, right: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12.0),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000), // shadow slightly stronger
            blurRadius: 16.0,
            offset: Offset(0, 8),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12.0),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            decoration: BoxDecoration(
              color: bgColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
            child: Center(child: Icon(iconData, color: Colors.white, size: 18.0)),
          ),
          const SizedBox(width: 14.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 4),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF1F2937))),
                if (description != null && description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(description, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
                ]
              ],
            ),
          ),
          const SizedBox(width: 8.0),
          GestureDetector(
            onTap: () => fToast.removeCustomToast(),
            child: const Padding(
              padding: EdgeInsets.only(top: 4),
              child: Icon(Icons.close, color: Color(0xFF6B7280), size: 18),
            ),
          )
        ],
      ),
          ),
        ),
      ),
    );

    fToast.showToast(
      child: toast,
      gravity: ToastGravity.TOP,
      toastDuration: const Duration(seconds: 4),
    );
  }
}
