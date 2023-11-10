import { useCallback, useEffect, useState } from 'react'
import { triggerErrorMessage } from '../../utils/locals';
import { Button } from 'react-bootstrap';
import { Tag } from '../posts/one-post';
interface Props {
  username: string
}
const CurrentTags:React.FC<Props> = ({username}) => {
  const [tags, setTags] = useState<Array<Tag>>([]);
  useEffect(() => {
    fetch('/profile/obtain_tags')
        .then(response => {
            if (response.status !== 200) {
                triggerErrorMessage();
            } else {
                response.json()
                    .then(response => {
                        setTags(response.tags);
                        console.log(tags);
                    });
            }
        });
    
    }, []);

  return (
    <div className='current-tag-container'>
      <div className="tag-title">Your Current Tags</div>
      <div className="tag-list">
          {tags.map(tag => (
                  <div className="tag-button btn btn-outline-info">
                      <img src={tag.icon} />
                      <div>{tag.name}</div>
                  </div>
          ))}
      </div>
    </div>
  )
}

export default CurrentTags
