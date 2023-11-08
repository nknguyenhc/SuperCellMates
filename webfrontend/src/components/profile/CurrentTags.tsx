import { useCallback, useEffect, useState } from 'react'
import { triggerErrorMessage } from '../../utils/locals';
import { Button } from 'react-bootstrap';
import { Tag } from '../posts/one-post';
interface Props {
  username: string
}
const CurrentTags:React.FC<Props> = ({username}) => {
  const [newTag, setNewTag] = useState<string>('');
  const [userTags, setUserTags] = useState<Array<Tag>>([]);
  const getTags = useCallback(() => {
    fetch('/profile/obtain_tags')
      .then (res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        } 
      })
  }, []);
  useEffect(() => {
    getTags();
  }, [getTags])
  const handleFindTag = useCallback(() => {
    fetch(`/profile/search_tags?tag=${newTag}`)
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
      })
  }, [newTag]);

  useEffect(() => {
    if (username !== '') {
        fetch('/profile/user_tags/' + username)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.json().then(response => setUserTags(response.tags as Array<Tag>));
                }
            });
    }
}, [username, userTags]);
  return (
    <div className='current-tag-container'>
        <div className='tag-list'>
            {userTags.length !== 0 ?  userTags.map((tag) => (
              <div className='tag-info'>
                <img className='tag-icon' src={tag.icon} alt={tag.name} />
                <p className='tag-title'>{tag.name}</p>
               

              </div>
            )) : "" }
        </div>
        <div className='tag-edit'>
          <input 
            type='text'
            placeholder='Enter a tag'
            onChange={(e) => setNewTag(e.target.value)}
            className='form-control newtag-input-field'
          />
          <Button
              className='find-tag-btn'
              onClick = {() => handleFindTag()}          
          >
            Find Tag
          </Button>
        </div>
        
      
    </div>
  )
}

export default CurrentTags
