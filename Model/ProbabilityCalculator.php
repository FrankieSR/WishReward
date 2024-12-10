<?php

namespace Doroshko\WishReward\Model;

class ProbabilityCalculator
{
    /**
     * Calculates the winning sector based on weighted probabilities.
     *
     * The method works as follows:
     * 1. **Input Data**: Accepts an array of sectors where each sector contains a `probability` field.
     *    The `probability` field defines the likelihood of the sector being chosen. 
     *    Example:
     *    [
     *        ['id' => 1, 'label' => 'Prize 1', 'probability' => 30], // 30% chance
     *        ['id' => 2, 'label' => 'Prize 2', 'probability' => 50], // 50% chance
     *        ['id' => 3, 'label' => 'Prize 3', 'probability' => 20], // 20% chance
     *    ]
     * 2. **Random Number**: A random number is generated between 1 and the total probability.
     *    For example, if the total probability is 100, the random number might be 45.
     * 3. **Iterative Selection**:
     *    - Iterate through the sectors, summing up probabilities.
     *    - The sector is chosen when the random number is less than or equal to the cumulative sum.
     *    - Example: If the random number is 45:
     *      - First sector: Cumulative probability = 30. Random > 30 → continue.
     *      - Second sector: Cumulative probability = 80. Random ≤ 80 → select this sector.
     * 4. **Fallback**: If no sector is selected during iteration (unlikely), the method returns the last sector.
     *
     * @param array $sectors Array of sectors with their probabilities.
     *                       Example:
     *                       [
     *                           ['id' => 1, 'label' => 'Prize 1', 'probability' => 30],
     *                           ['id' => 2, 'label' => 'Prize 2', 'probability' => 50],
     *                           ['id' => 3, 'label' => 'Prize 3', 'probability' => 20],
     *                       ]
     * @return array The winning sector.
     * @throws \InvalidArgumentException If the sectors array is empty or probabilities are invalid.
     */
    public function getWinningSector(array $sectors): array
    {
        // Ensure the sectors array is not empty
        if (empty($sectors)) {
            throw new \InvalidArgumentException('Sectors array cannot be empty.');
        }

        // Calculate the total sum of probabilities
        $totalProbability = array_sum(array_column($sectors, 'probability'));

        // Validate that the total probability is greater than 0
        if ($totalProbability <= 0) {
            throw new \InvalidArgumentException('Total probability must be greater than zero.');
        }

        // Generate a random number between 1 and the total probability
        $random = rand(1, $totalProbability);

        $currentSum = 0;

        // Iterate through each sector
        foreach ($sectors as $sector) {
            // Accumulate probabilities
            $currentSum += $sector['probability'];

            // Check if the random number falls within the current range
            if ($random <= $currentSum) {
                return $sector; // Return the winning sector
            }
        }

        // Fallback to the last sector if no match found
        return end($sectors);
    }
}
