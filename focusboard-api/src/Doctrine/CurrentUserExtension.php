<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Board;
use App\Entity\SubTask;
use App\Entity\Tag;
use App\Entity\Task;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private Security $security) {}

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        $user = $this->security->getUser();
        if (!$user) return;

        $rootAlias = $queryBuilder->getRootAliases()[0];

        if (Board::class === $resourceClass || Tag::class === $resourceClass) {
            $queryBuilder->andWhere(sprintf('%s.owner = :current_user', $rootAlias));
            $queryBuilder->setParameter('current_user', $user);
        }
        elseif (Task::class === $resourceClass) {
            $queryBuilder->join(sprintf('%s.board', $rootAlias), 'b');
            $queryBuilder->andWhere('b.owner = :current_user');
            $queryBuilder->setParameter('current_user', $user);
        }
        elseif (SubTask::class === $resourceClass) {
            $queryBuilder->join(sprintf('%s.task', $rootAlias), 't');
            $queryBuilder->join('t.board', 'b');
            $queryBuilder->andWhere('b.owner = :current_user');
            $queryBuilder->setParameter('current_user', $user);
        }
    }
}
