import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isLoading, String? error, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  bool get isAuthenticated => user != null;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;

  AuthNotifier(this._api) : super(AuthState()) {
    _checkAuth();
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
        );
      } else {
        state = state.copyWith(isLoading: false, clearUser: true);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, clearUser: true);
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
          _api.setToken(token);
        }
        state = state.copyWith(user: User.fromJson(userData), isLoading: false);
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
          _api.setToken(token);
        }
        state = state.copyWith(user: User.fromJson(userData), isLoading: false);
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
    _api.setToken(null);
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(apiClient);
});
