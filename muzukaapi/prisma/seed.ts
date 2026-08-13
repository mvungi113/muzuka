import 'dotenv/config';
import { PrismaClient, Role, SongStatus, AlbumStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.listeningHistory.deleteMany();
  await prisma.recentlyPlayed.deleteMany();
  await prisma.download.deleteMany();
  await prisma.songLike.deleteMany();
  await prisma.albumLike.deleteMany();
  await prisma.artistFollower.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.songMood.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.mood.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const password = await hashPassword('password123');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@muzuka.com',
      passwordHash: password,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Music Lover',
      email: 'user@muzuka.com',
      passwordHash: password,
      role: Role.USER,
    },
  });

  console.log('Created users');

  // Genres
  const genres = await Promise.all([
    prisma.genre.create({ data: { name: 'Bongo Flava', slug: 'bongo-flava' } }),
    prisma.genre.create({ data: { name: 'Afrobeats', slug: 'afrobeats' } }),
    prisma.genre.create({ data: { name: 'Amapiano', slug: 'amapiano' } }),
    prisma.genre.create({ data: { name: 'Hip Hop', slug: 'hip-hop' } }),
    prisma.genre.create({ data: { name: 'R&B', slug: 'rnb' } }),
    prisma.genre.create({ data: { name: 'Gospel', slug: 'gospel' } }),
    prisma.genre.create({ data: { name: 'Pop', slug: 'pop' } }),
    prisma.genre.create({ data: { name: 'Dance', slug: 'dance' } }),
    prisma.genre.create({ data: { name: 'Reggae', slug: 'reggae' } }),
    prisma.genre.create({ data: { name: 'Electronic', slug: 'electronic' } }),
  ]);

  console.log('Created genres');

  // Moods
  const moods = await Promise.all([
    prisma.mood.create({ data: { name: 'Happy', slug: 'happy', color: '#FFD93D', icon: '😊' } }),
    prisma.mood.create({ data: { name: 'Romantic', slug: 'romantic', color: '#FF6B6B', icon: '❤️' } }),
    prisma.mood.create({ data: { name: 'Chill', slug: 'chill', color: '#6BCB77', icon: '😌' } }),
    prisma.mood.create({ data: { name: 'Energy', slug: 'energy', color: '#FFD93D', icon: '⚡' } }),
    prisma.mood.create({ data: { name: 'Sad', slug: 'sad', color: '#6C63FF', icon: '😢' } }),
    prisma.mood.create({ data: { name: 'Party', slug: 'party', color: '#FF6B6B', icon: '🎉' } }),
    prisma.mood.create({ data: { name: 'Workout', slug: 'workout', color: '#FFD93D', icon: '💪' } }),
    prisma.mood.create({ data: { name: 'Worship', slug: 'worship', color: '#6C63FF', icon: '🙏' } }),
    prisma.mood.create({ data: { name: 'Focus', slug: 'focus', color: '#6BCB77', icon: '🎯' } }),
    prisma.mood.create({ data: { name: 'Relax', slug: 'relax', color: '#6BCB77', icon: '🧘' } }),
  ]);

  console.log('Created moods');

  // Artists
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'Diamond Platnumz',
        slug: 'diamond-platnumz',
        biography: 'Tanzanian bongo flava artist and songwriter. One of East Africa\'s most celebrated musicians.',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Burna Boy',
        slug: 'burna-boy',
        biography: 'Nigerian singer and songwriter. Known for his fusion of afrobeats, dancehall, and reggae.',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Zuchu',
        slug: 'zuchu',
        biography: 'Tanzanian singer and songwriter. Queen of Bongo Flava.',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Rema',
        slug: 'rema',
        biography: 'Nigerian singer and songwriter. Known for his unique blend of afrobeats and pop.',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Adekunle Gold',
        slug: 'adekunle-gold',
        biography: 'Nigerian singer and songwriter. Known for his smooth afrobeats and highlife sound.',
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Rayvanny',
        slug: 'rayvanny',
        biography: 'Tanzanian bongo flava artist. Known for his energetic performances.',
      },
    }),
  ]);

  console.log('Created artists');

  // Albums
  const albums = await Promise.all([
    prisma.album.create({
      data: {
        title: 'First of All',
        slug: 'first-of-all',
        artistId: artists[0].id,
        status: AlbumStatus.PUBLISHED,
        releaseDate: new Date('2024-01-15'),
      },
    }),
    prisma.album.create({
      data: {
        title: 'African Giant',
        slug: 'african-giant',
        artistId: artists[1].id,
        status: AlbumStatus.PUBLISHED,
        releaseDate: new Date('2023-06-20'),
      },
    }),
    prisma.album.create({
      data: {
        title: 'I Am Zuchu',
        slug: 'i-am-zuchu',
        artistId: artists[2].id,
        status: AlbumStatus.PUBLISHED,
        releaseDate: new Date('2024-03-10'),
      },
    }),
    prisma.album.create({
      data: {
        title: 'Rave & Roses',
        slug: 'rave-and-roses',
        artistId: artists[3].id,
        status: AlbumStatus.PUBLISHED,
        releaseDate: new Date('2024-02-28'),
      },
    }),
    prisma.album.create({
      data: {
        title: 'Gold',
        slug: 'gold',
        artistId: artists[4].id,
        status: AlbumStatus.PUBLISHED,
        releaseDate: new Date('2023-09-05'),
      },
    }),
  ]);

  console.log('Created albums');

  // Songs
  const songData = [
    { title: 'Jeje', artistIdx: 0, albumIdx: 0, genreIdx: 0, moodSlugs: ['happy', 'party'], playCount: 15420 },
    { title: 'Waka Waka', artistIdx: 0, albumIdx: 0, genreIdx: 0, moodSlugs: ['happy', 'energy'], playCount: 12300 },
    { title: 'One By One', artistIdx: 0, albumIdx: 0, genreIdx: 0, moodSlugs: ['romantic', 'chill'], playCount: 8900 },
    { title: 'Last Last', artistIdx: 1, albumIdx: 1, genreIdx: 1, moodSlugs: ['sad', 'romantic'], playCount: 25000 },
    { title: 'Ye', artistIdx: 1, albumIdx: 1, genreIdx: 1, moodSlugs: ['chill', 'relax'], playCount: 30000 },
    { title: 'On the Low', artistIdx: 1, albumIdx: 1, genreIdx: 1, moodSlugs: ['chill', 'romantic'], playCount: 22000 },
    { title: 'Sukari', artistIdx: 2, albumIdx: 2, genreIdx: 0, moodSlugs: ['happy', 'romantic'], playCount: 11000 },
    { title: 'Wana', artistIdx: 2, albumIdx: 2, genreIdx: 0, moodSlugs: ['party', 'energy'], playCount: 9500 },
    { title: 'I’m So Pretty', artistIdx: 2, albumIdx: 2, genreIdx: 0, moodSlugs: ['happy', 'workout'], playCount: 7800 },
    { title: 'Calm Down', artistIdx: 3, albumIdx: 3, genreIdx: 1, moodSlugs: ['chill', 'relax'], playCount: 35000 },
    { title: 'Soundgasm', artistIdx: 3, albumIdx: 3, genreIdx: 1, moodSlugs: ['party', 'energy'], playCount: 18000 },
    { title: 'Iron Man', artistIdx: 3, albumIdx: 3, genreIdx: 1, moodSlugs: ['happy', 'chill'], playCount: 14000 },
    { title: 'Sinner', artistIdx: 4, albumIdx: 4, genreIdx: 1, moodSlugs: ['romantic', 'chill'], playCount: 12000 },
    { title: 'High', artistIdx: 4, albumIdx: 4, genreIdx: 1, moodSlugs: ['happy', 'energy'], playCount: 10000 },
    { title: 'Selense', artistIdx: 5, genreIdx: 0, moodSlugs: ['happy', 'party'], playCount: 8500 },
    { title: 'Tetema', artistIdx: 5, genreIdx: 0, moodSlugs: ['party', 'workout'], playCount: 13000 },
    { title: 'Nana', artistIdx: 5, genreIdx: 0, moodSlugs: ['romantic', 'happy'], playCount: 7200 },
    { title: 'Peru', artistIdx: 1, genreIdx: 1, moodSlugs: ['party', 'happy'], playCount: 20000 },
    { title: 'Kilometre', artistIdx: 1, genreIdx: 1, moodSlugs: ['energy', 'workout'], playCount: 16000 },
    { title: 'Bloody Samaritan', artistIdx: 2, genreIdx: 0, moodSlugs: ['energy', 'party'], playCount: 9000 },
  ];

  const songs = [];
  for (const data of songData) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const song = await prisma.song.create({
      data: {
        title: data.title,
        slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
        artistId: artists[data.artistIdx].id,
        albumId: data.albumIdx !== undefined ? albums[data.albumIdx]?.id : undefined,
        genreId: genres[data.genreIdx].id,
        status: SongStatus.PUBLISHED,
        playCount: data.playCount,
        duration: 180 + Math.floor(Math.random() * 120),
      },
    });

    for (const moodSlug of data.moodSlugs) {
      const mood = moods.find(m => m.slug === moodSlug);
      if (mood) {
        await prisma.songMood.create({
          data: { songId: song.id, moodId: mood.id },
        });
      }
    }

    songs.push(song);
  }

  console.log(`Created ${songs.length} songs`);

  // Playlists
  const playlist = await prisma.playlist.create({
    data: {
      name: 'My Favorites',
      userId: user.id,
      isPublic: true,
    },
  });

  for (let i = 0; i < Math.min(5, songs.length); i++) {
    await prisma.playlistSong.create({
      data: {
        playlistId: playlist.id,
        songId: songs[i].id,
        position: i,
      },
    });
  }

  console.log('Created playlist');

  // Song likes
  for (let i = 0; i < Math.min(8, songs.length); i++) {
    await prisma.songLike.create({
      data: { userId: user.id, songId: songs[i].id },
    });
  }

  console.log('Created song likes');

  // Listening history
  for (let i = 0; i < Math.min(10, songs.length); i++) {
    await prisma.listeningHistory.create({
      data: {
        userId: user.id,
        songId: songs[i].id,
        durationPlayed: 120 + Math.floor(Math.random() * 60),
        completed: Math.random() > 0.3,
      },
    });
  }

  console.log('Created listening history');

  console.log('\nSeed complete!');
  console.log('Admin login: admin@muzuka.com / password123');
  console.log('User login:  user@muzuka.com  / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
