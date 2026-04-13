<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\BoardRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: BoardRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['board:read']],
    denormalizationContext: ['groups' => ['board:write']],
    order: ['position' => 'ASC'],
)]
class Board
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['board:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['board:read', 'board:write'])]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['board:read', 'board:write'])]
    private ?string $color = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['board:read', 'board:write'])]
    private ?string $icon = null;

    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'board', orphanRemoval: true)]
    #[Groups(['board:read'])]
    private Collection $tasks;

    #[ORM\Column(nullable: true)]
    #[Groups(['board:read', 'board:write'])]
    private ?int $position = null;

    public function __construct()
    {
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    /**
     * @return Collection<int, Task>
     */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }

    public function addTask(Task $task): static
    {
        if (!$this->tasks->contains($task)) {
            $this->tasks->add($task);
        }

        return $this;
    }

    public function removeTask(task $task): static
    {
        $this->tasks->removeElement($task);

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): static
    {
        $this->position = $position; return $this;
    }
}
