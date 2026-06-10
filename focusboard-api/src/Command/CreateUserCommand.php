<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Create a new user',
)]
class CreateUserCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('User creation wizard');

        $username = $io->ask("What's your username?", null, function (?string $username) {
            if (empty(trim((string) $username))) {
                throw new \RuntimeException('The username cannot be empty.');
            }

            return $username;
        });

        $role = $io->ask('What is the role?', 'ROLE_USER');

        $password = $io->askHidden("What's your password?", function (?string $password) {
            if (empty(trim((string) $password))) {
                throw new \RuntimeException('The password cannot be empty.');
            }

            return $password;
        });

        /** @var User $user */
        $user = new User();
        $user->setUsername($username);
        $user->setRoles([$role]);
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success(sprintf('User "%s" has been successfully created with role "%s".', $user->getUsername(), $role));

        return Command::SUCCESS;
    }
}
