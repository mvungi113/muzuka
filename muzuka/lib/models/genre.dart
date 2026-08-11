class Genre {
  final String id;
  final String name;
  final String slug;
  final String? image;
  final int songCount;

  Genre({
    required this.id,
    required this.name,
    required this.slug,
    this.image,
    this.songCount = 0,
  });

  factory Genre.fromJson(Map<String, dynamic> json) => Genre(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        image: json['image'],
        songCount: json['_count']?['songs'] ?? json['songCount'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'image': image,
      };
}

class Mood {
  final String id;
  final String name;
  final String slug;
  final String? color;
  final String? icon;
  final int songCount;

  Mood({
    required this.id,
    required this.name,
    required this.slug,
    this.color,
    this.icon,
    this.songCount = 0,
  });

  factory Mood.fromJson(Map<String, dynamic> json) => Mood(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        color: json['color'],
        icon: json['icon'],
        songCount: json['_count']?['songMoods'] ?? json['songCount'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'color': color,
        'icon': icon,
      };
}
