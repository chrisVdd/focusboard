<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Board;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class OwnerProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persisteProcessor,
        private Security $security,
    )
    {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (method_exists($data, 'setOwner') && $this->security->getUser()) {
            $data->setOwner($this->security->getUser());
        }

        return $this->persisteProcessor->process($data, $operation, $uriVariables, $context);
    }
}
