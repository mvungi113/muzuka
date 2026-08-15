import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

const _deviceIdKey = 'muzuka_device_id';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;
  final bool isAnonymous;

  AuthState({this.user, this.isLoading = false, this.error, this.isAnonymous = false});

  AuthState copyWith({User? user, bool? isLoading, String? error, bool clearUser = false, bool? isAnonymous}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAnonymous: isAnonymous ?? this.isAnonymous,
    );
  }

  bool get isAuthenticated => user != null;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;

  AuthNotifier(this._api) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    await _api.loadToken();
    if (_api.hasToken) {
      await _checkAuth();
    } else {
      await _registerDevice();
    }
  }

  Future<void> _checkAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.me,
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        state = state.copyWith(
          user: User.fromJson(response.data!),
          isLoading: false,
          isAnonymous: response.data!['isAnonymous'] == true,
        );
      } else {
        await _registerDevice();
      }
    } catch (e) {
      await _registerDevice();
    }
  }

  Future<String> _getOrCreateDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    var deviceId = prefs.getString(_deviceIdKey);
    if (deviceId == null) {
      deviceId = const Uuid().v4();
      await prefs.setString(_deviceIdKey, deviceId);
    }
    return deviceId;
  }

  Future<void> _registerDevice() async {
    state = state.copyWith(isLoading: true);
    try {
      final deviceId = await _getOrCreateDeviceId();
      final response = await _api.post<Map<String, dynamic>>(
        ApiConstants.device,
        body: {'deviceId': deviceId},
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final userData = response.data!['user'];
        final token = response.data!['token'] as String?;
        if (token != null) {
          await _api.setToken(token);
        }
        state = state.copyWith(
          user: User.fromJson(userData),
          isLoading: false,
          isAnonymous: true,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiConstants.login,
        body: {'email': email, 'password': password},
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final userData = response.data!['user'];
        final token = response.data!['token'] as String?;
        if (token != null) {
          await _api.setToken(token);
        }
        state = state.copyWith(
          user: User.fromJson(userData),
          isLoading: false,
          isAnonymous: false,
        );
        return true;
      }
      state = state.copyWith(isLoading: false, error: response.message ?? 'Login failed');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiConstants.register,
        body: {'name': name, 'email': email, 'password': password},
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final userData = response.data!['user'];
        final token = response.data!['token'] as String?;
        if (token != null) {
          await _api.setToken(token);
        }
        state = state.copyWith(
          user: User.fromJson(userData),
          isLoading: false,
          isAnonymous: false,
        );
        return true;
      }
      state = state.copyWith(isLoading: false, error: response.message ?? 'Registration failed');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _api.post(ApiConstants.logout);
    await _api.setToken(null);
    state = AuthState();
    await _registerDevice();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(apiClient);
});
