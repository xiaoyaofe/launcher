import React from 'react';
import { assert } from 'chai';
import { spy } from 'sinon';
import { createShallow, createMount, getClasses, unwrap } from 'src/bower/material-ui/packages/material-ui/src/test-utils';
import ButtonBase from '../ButtonBase';
import ExpansionPanelSummary from './ExpansionPanelSummary';

describe('<ExpansionPanelSummary />', () => {
  let mount;
  let shallow;
  let classes;
  const ExpansionPanelSummaryNaked = unwrap(ExpansionPanelSummary);

  before(() => {
    shallow = createShallow({ dive: true });
    mount = createMount();
    classes = getClasses(<ExpansionPanelSummary />);
  });

  after(() => {
    mount.cleanUp();
  });

  it('should render a ButtonBase', () => {
    const wrapper = shallow(<ExpansionPanelSummary />);
    assert.strictEqual(wrapper.type(), ButtonBase);
  });

  it('should render with the user and root classes', () => {
    const wrapper = shallow(<ExpansionPanelSummary className="woofExpansionPanelSummary" />);
    assert.strictEqual(wrapper.hasClass(classes.root), true);
    assert.strictEqual(wrapper.hasClass('woofExpansionPanelSummary'), true);
  });

  it('should render with the content', () => {
    const wrapper = shallow(<ExpansionPanelSummary />);
    const itemsWrap = wrapper.childAt(0);
    assert.strictEqual(itemsWrap.hasClass(classes.content), true);
  });

  it('when disabled should have disabled class', () => {
    const wrapper = shallow(<ExpansionPanelSummary disabled />);
    assert.strictEqual(wrapper.hasClass(classes.disabled), true);
  });

  it('when expanded should have expanded class', () => {
    const wrapper = shallow(<ExpansionPanelSummary expanded />);
    assert.strictEqual(wrapper.hasClass(classes.expanded), true);
  });

  it('should render with the expand icon and have the expandIcon class', () => {
    const wrapper = shallow(<ExpansionPanelSummary expandIcon={<div>Icon</div>} />);
    const iconWrap = wrapper.childAt(1);
    assert.strictEqual(iconWrap.hasClass(classes.expandIcon), true);
  });

  it('handleFocusVisible() should set focused state', () => {
    const eventMock = 'woofExpansionPanelSummary';
    const wrapper = mount(<ExpansionPanelSummaryNaked classes={{}} />);
    wrapper.instance().handleFocusVisible(eventMock);
    assert.strictEqual(wrapper.state().focused, true);
  });

  it('handleBlur() should unset focused state', () => {
    const eventMock = 'woofExpansionPanelSummary';
    const wrapper = mount(<ExpansionPanelSummaryNaked classes={{}} />);
    wrapper.setState({ focused: true });
    wrapper.instance().handleBlur(eventMock);
    assert.strictEqual(wrapper.state().focused, false);
  });

  describe('event callbacks', () => {
    it('should fire event callbacks', () => {
      const events = ['onClick', 'onFocusVisible', 'onBlur'];

      const handlers = events.reduce((result, n) => {
        result[n] = spy();
        return result;
      }, {});

      const wrapper = shallow(<ExpansionPanelSummary {...handlers} />);

      events.forEach(n => {
        const event = n.charAt(2).toLowerCase() + n.slice(3);
        wrapper.simulate(event, { persist: () => {} });
        assert.strictEqual(handlers[n].callCount, 1, `should have called the ${n} handler`);
      });
    });
  });

  describe('prop: onChange', () => {
    it('should propagate call to onChange prop', () => {
      const eventMock = 'woofExpansionPanelSummary';
      const handleChange = spy();
      const wrapper = mount(<ExpansionPanelSummaryNaked classes={{}} onChange={handleChange} />);
      wrapper.instance().handleChange(eventMock);
      assert.strictEqual(handleChange.callCount, 1);
      assert.strictEqual(handleChange.calledWith(eventMock), true);
    });

    it('should not propagate call to onChange prop', () => {
      const eventMock = 'woofExpansionPanelSummary';
      const handleChange = spy();
      const wrapper = mount(<ExpansionPanelSummaryNaked classes={{}} onChange={handleChange} />);
      wrapper.setProps({ onChange: undefined });
      wrapper.instance().handleChange(eventMock);
      assert.strictEqual(handleChange.callCount, 0);
    });
  });

  describe('prop: click', () => {
    it('should trigger onClick', () => {
      const handleClick = spy();
      const wrapper = shallow(<ExpansionPanelSummary onClick={handleClick} />);
      wrapper.simulate('click');
      assert.strictEqual(handleClick.callCount, 1);
    });
  });
});
