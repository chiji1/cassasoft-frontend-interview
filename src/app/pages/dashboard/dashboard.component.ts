import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IngredientRequestsService } from 'src/app/services/ingredient-requests.service';
import { Ingredient } from 'src/app/types/ingredients.type';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  ingredients$: Observable<Ingredient[]>;
  totalIngredients$: Observable<number>;
  lastActivity: Date;

  constructor(
    private readonly ingredientReqSrv: IngredientRequestsService,
  ) { }

  ngOnInit(): void {
    this.ingredients$ =
    this.ingredientReqSrv
    .getAll()
    .pipe(
      map((res) => res.payload)
    );
  }

  calculateDateOfLastActivity(payload: Ingredient[]): Date {
    const dateValues = payload.map((ingredient) => new Date(ingredient.createdAt).getTime());
    return new Date(Math.max(...dateValues));
  }

}
