import React from 'react';
import Button from 'src/bower/material-ui/packages/material-ui/src/Button';

export default function MaterialV1Buttons() {
  return (
    <div>
      <Button variant="flat">Flat</Button>
      <Button variant="flat" color="primary">
        Flat
      </Button>
      <Button variant="flat" color="secondary">
        Flat
      </Button>
      <Button variant="raised">Raised</Button>
      <Button variant="raised" color="primary">
        Raised
      </Button>
      <Button variant="raised" color="secondary">
        Raised
      </Button>
    </div>
  );
}
