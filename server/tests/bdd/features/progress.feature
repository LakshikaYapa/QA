Feature: Learner progress tracking
  Learners can record progress for skills and receive a clear error if saved
  progress cannot be retrieved.

  Scenario Outline: Learners can record progress at either inclusive boundary
    Given an authenticated learner
    And the learner owns skill "skill-1"
    When the learner records <value> percent progress
    Then the API creates a progress record at <value> percent

    Examples:
      | value |
      | 0     |
      | 100   |

  Scenario: A database failure is reported when loading progress
    Given an authenticated learner
    And the progress database is unavailable
    When the learner loads progress
    Then the API responds with a server error
