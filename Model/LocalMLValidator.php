<?php

namespace Doroshko\WishReward\Model;

class LocalMLValidator
{
    private array $model;

    public function __construct()
    {
        $this->loadModel();
    }

    /**
     * Загружает JSON-модель из файла.
     */
    private function loadModel(): void
    {
        $modelPath = BP . '/app/code/Doroshko/WishReward/etc/model.json';
        if (!file_exists($modelPath)) {
            throw new \Exception('ML model not found');
        }

        $this->model = json_decode(file_get_contents($modelPath), true);

        // Проверка структуры модели
        if (!isset($this->model['classes'], $this->model['vocabulary'], $this->model['class_log_prior'], $this->model['feature_log_prob'])) {
            throw new \Exception('ML model structure is invalid');
        }
    }

    /**
     * Проверяет текст на основе модели и возвращает статус и причину.
     * @param string $text
     * @return array
     */
    public function validateText(string $text): array
    {
        // Проверка длины текста
        if (mb_strlen($text) < 6) {
            return [
                'status' => 'invalid',
                'reason' => 'Text is too short. Minimum 6 characters required.'
            ];
        }

        // Векторизация текста
        $vectorizedText = $this->vectorize($text);

        // Если вектор пустой, текст невалиден
        if (empty($vectorizedText['validWordCount'])) {
            return [
                'status' => 'invalid',
                'reason' => 'No significant words from the vocabulary were found.'
            ];
        }

        // Проверка количества значимых слов
        if ($vectorizedText['validWordCount'] < 2) {
            return [
                'status' => 'invalid',
                'reason' => 'At least 2 significant words from the vocabulary are required.'
            ];
        }

        // Предсказание класса
        $prediction = $this->predict($vectorizedText['vector']);
        if ($prediction === 1) {
            return [
                'status' => 'valid',
                'reason' => 'Text successfully classified as valid.'
            ];
        } else {
            return [
                'status' => 'invalid',
                'reason' => 'Text does not match valid classification criteria.'
            ];
        }
    }

    /**
     * Преобразует текст в числовой вектор на основе словаря модели.
     * @param string $text
     * @return array
     */
    private function vectorize(string $text): array
    {
        $vector = array_fill(0, count($this->model['vocabulary']), 0);

        // Токенизация текста
        $words = preg_split('/\s+/', mb_strtolower(trim($text)), -1, PREG_SPLIT_NO_EMPTY);

        $validWordCount = 0;

        foreach ($words as $word) {
            if (isset($this->model['vocabulary'][$word])) {
                $index = $this->model['vocabulary'][$word];
                $vector[$index]++;
                $validWordCount++;
            }
        }

        return [
            'vector' => $vector,
            'validWordCount' => $validWordCount
        ];
    }

    /**
     * Предсказывает класс для заданного вектора текста.
     * @param array $vector
     * @return int
     */
    private function predict(array $vector): int
    {
        $scores = [];
        $nonZeroFeatures = array_filter($vector, fn($count) => $count > 0);

        if (empty($nonZeroFeatures)) {
            // Если вектор пустой или нет совпадений в словаре, возвращаем "невалидный"
            return 0;
        }

        foreach ($this->model['classes'] as $classIndex => $class) {
            $score = $this->model['class_log_prior'][$classIndex];

            foreach ($vector as $wordIndex => $count) {
                if ($count > 0 && isset($this->model['feature_log_prob'][$classIndex][$wordIndex])) {
                    $score += $count * $this->model['feature_log_prob'][$classIndex][$wordIndex];
                }
            }

            $scores[$class] = $score;
        }

        arsort($scores);

        // Проверка значимого преимущества
        $bestScore = reset($scores);
        $secondBestScore = next($scores);

        if (($bestScore - $secondBestScore) < 1) {
            return 0;
        }

        return (int)array_key_first($scores);
    }
}
