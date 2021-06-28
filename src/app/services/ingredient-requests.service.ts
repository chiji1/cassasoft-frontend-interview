import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import {
  HttpSuccessRequest,
  Ingredient,
  SpoonocularResult,
  SpoonocularIngredient,
  SpoonocularIngredientInformation
} from '../types/ingredients.type';

@Injectable({
  providedIn: 'root'
})
export class IngredientRequestsService {

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  post(title: string, imageBase64Url: string): Observable<HttpSuccessRequest<Ingredient>> {
    const formData: FormData = new FormData();
    formData.append('title', title);
    formData.append('image', imageBase64Url);
    return this.httpClient.post<HttpSuccessRequest<Ingredient>>(`${env.apiRoot}/api/ingredients`, formData)
        .pipe(map(res => res));
  }

  getAll(): Observable<HttpSuccessRequest<Ingredient[]>> {
    return this.httpClient.get<HttpSuccessRequest<Ingredient[]>>(`${env.apiRoot}/api/ingredients`);
  }

  getSingle(ingredientId: string): Observable<HttpSuccessRequest<Ingredient>> {
    return this.httpClient
                .get<HttpSuccessRequest<Ingredient>>(`${env.apiRoot}/api/ingredients/${ingredientId}`)
                .pipe(first());
  }

  put(ingredient: Ingredient): Observable<HttpSuccessRequest<Ingredient>> {
    const { fat, image, title, calories, carbohydrates } = ingredient;
    const formData: FormData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('fat', `${fat}`);
    formData.append('calories', `${calories}`);
    formData.append('carbohydrates', `${carbohydrates}`);
    return this.httpClient.put<HttpSuccessRequest<Ingredient>>(`${env.apiRoot}/api/ingredients/${ingredient.id}`, formData)
        .pipe(map((res) => res));
  }

  delete(ingredientId: string): Observable<HttpSuccessRequest<Ingredient>> {
    return this.httpClient.delete<HttpSuccessRequest<Ingredient>>(`${env.apiRoot}/api/ingredients/${ingredientId}`);
  }

  // ? Spoonocular api Third-party
  searchIngredient(searchTerm: string): Observable<SpoonocularIngredient[]> {
    return this.httpClient
              .get<SpoonocularResult>(`${env.spoonocular.apiRoot}/ingredients/search?query=${searchTerm}&apiKey=${env.spoonocular.apiKey}&number=1`)
              .pipe(
                map((res) => res.results),
              );
  }

  getSpoonocularIngredientInfo(ingredientId: number): Observable<SpoonocularIngredientInformation> {
    return this.httpClient.get<SpoonocularIngredientInformation>(`${env.spoonocular.apiRoot}/ingredients/${ingredientId}/information?apiKey=${env.spoonocular.apiKey}&amount=100&unit=g`);
  }
}
