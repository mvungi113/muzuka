class User {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String role;
  final bool isAnonymous;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.role,
    this.isAnonymous = false,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        avatarUrl: json['avatarUrl'],
        role: json['role'] ?? 'USER',
        isAnonymous: json['isAnonymous'] ?? false,
        createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'avatarUrl': avatarUrl,
        'role': role,
        'isAnonymous': isAnonymous,
        'createdAt': createdAt.toIso8601String(),
      };
}
