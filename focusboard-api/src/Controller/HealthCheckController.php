<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HealthCheckController extends AbstractController
{
    #[Route('/', name: 'api_health_check', methods: ['GET'])]
    public function check(): JsonResponse
    {
        return $this->json([
            'status' => 'success',
            'message' => 'Focusboard API is up and running smoothly !',
            'environment' => $_ENV['APP_ENV'] ?? 'unknown',
            'timestamp' => time(),
        ]);
    }
}
