import BasePage from './BasePage';

export default class WorkoutPage extends BasePage {
  public get exerciseSearch() { return this.getByTestId('workout-search-input'); }
  public get exerciseList() { return this.getByTestId('workout-exercise-list'); }
  public get startWorkoutBtn() { return this.getByTestId('workout-start-btn'); }
  public get pauseWorkoutBtn() { return this.getByTestId('workout-pause-btn'); }
  public get stopWorkoutBtn() { return this.getByTestId('workout-stop-btn'); }

  public async startWorkout(): Promise<void> {
    await this.waitAndClick('workout-start-btn');
  }
}
