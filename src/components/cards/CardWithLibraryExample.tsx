import React from 'react';
import { LandmarkCard } from './LandmarkCard';
import { DelveCard } from './DelveCard';
import { MonsterCard } from './MonsterCard';
import { useLibrary } from '../../hooks/useLibrary';
import { useLandmarks } from '../../hooks/useLandmarks';
import { useDelves } from '../../hooks/useDelves';
import { Landmark, Delve, Monster } from '../../types';

/**
 * Example component showing how to connect cards with library functionality
 * This demonstrates the "Save to Library" feature integration
 */

interface CardWithLibraryExampleProps {
  landmark?: Landmark;
  delve?: Delve;
  monster?: Monster;
  delveId?: string; // Required for monster operations
}

export const CardWithLibraryExample: React.FC<CardWithLibraryExampleProps> = ({
  landmark,
  delve,
  monster,
  delveId
}) => {
  const {
    addLandmarkToLibrary,
    addDelveToLibrary,
    addMonsterToLibrary
  } = useLibrary();

  const { updateLandmark, deleteLandmark } = useLandmarks();
  const { updateDelve, deleteDelve, deleteMonster } = useDelves();

  const handleSaveLandmarkToLibrary = (landmark: Landmark) => {
    addLandmarkToLibrary(landmark);
    // Optionally show a success message
    console.log(`Saved landmark "${landmark.name}" to library`);
  };

  const handleSaveDelveToLibrary = (delve: Delve) => {
    addDelveToLibrary(delve);
    // Optionally show a success message
    console.log(`Saved delve "${delve.name}" to library`);
  };

  const handleSaveMonsterToLibrary = (monster: Monster) => {
    addMonsterToLibrary(monster);
    // Optionally show a success message
    console.log(`Saved monster "${monster.name}" to library`);
  };

  return (
    <div className="card-with-library-example">
      {landmark && (
        <LandmarkCard
          landmark={landmark}
          onUpdate={(updatedLandmark) => updateLandmark(landmark.id, updatedLandmark)}
          onDelete={deleteLandmark}
          onSaveToLibrary={handleSaveLandmarkToLibrary}
        />
      )}

      {delve && (
        <DelveCard
          delve={delve}
          onUpdate={(updatedDelve) => updateDelve(delve.id, updatedDelve)}
          onDelete={deleteDelve}
          onSaveToLibrary={handleSaveDelveToLibrary}
          onAddMonster={(delveId) => {
            // This would typically open a monster creation form
            console.log(`Add monster to delve ${delveId}`);
          }}
          onEditMonster={(delveId, monsterId) => {
            // This would typically open a monster edit form
            console.log(`Edit monster ${monsterId} in delve ${delveId}`);
          }}
          onDeleteMonster={(delveId, monsterId) => {
            deleteMonster(delveId, monsterId);
          }}
        />
      )}

      {monster && delveId && (
        <MonsterCard
          monster={monster}
          onEdit={() => {
            // This would typically open a monster edit form
            console.log(`Edit monster ${monster.id}`);
          }}
          onDelete={() => {
            deleteMonster(delveId, monster.id);
          }}
          onSaveToLibrary={handleSaveMonsterToLibrary}
        />
      )}
    </div>
  );
};