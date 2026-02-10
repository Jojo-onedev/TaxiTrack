import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/geocoding_service.dart';

// Events
abstract class SearchEvent extends Equatable {
  const SearchEvent();
  @override
  List<Object> get props => [];
}

class QueryChanged extends SearchEvent {
  final String query;
  const QueryChanged(this.query);
  @override
  List<Object> get props => [query];
}

// States
abstract class SearchState extends Equatable {
  const SearchState();
  @override
  List<Object> get props => [];
}

class SearchInitial extends SearchState {}

class SearchLoading extends SearchState {}

class SearchResults extends SearchState {
  final List<SearchSuggestion> suggestions;
  const SearchResults(this.suggestions);
  @override
  List<Object> get props => [suggestions];
}

class SearchError extends SearchState {
  final String message;
  const SearchError(this.message);
  @override
  List<Object> get props => [message];
}

// BLoC
class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final GeocodingService _geocodingService;

  SearchBloc(this._geocodingService) : super(SearchInitial()) {
    on<QueryChanged>(_onQueryChanged);
  }

  Future<void> _onQueryChanged(
    QueryChanged event,
    Emitter<SearchState> emit,
  ) async {
    if (event.query.isEmpty) {
      emit(SearchInitial());
      return;
    }

    emit(SearchLoading());
    try {
      final results = await _geocodingService.search(event.query);
      emit(SearchResults(results));
    } catch (e) {
      emit(SearchError(e.toString()));
    }
  }
}
